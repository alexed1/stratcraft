window._expressionParser = (function () {
  var _typeHasStringValue = function (type) {
    return type === 'STRING' || type === 'TEXTAREA' || type === 'EMAIL';
  };

  var _getTransition = function (currentState, schema, operators, value, tokens) {
    value = value || '';
    if (!currentState.hasObject) {
      //Checks if the value starts with a valid object name (e.g. $User)
      var objectNameMatch = value.match(/\$[a-z]+/gi)
      //Checks if the value ends with symbols that forcefully finish object name typing (e.g. if after '$User' we typed space or dot)
      var forceObjectTerminationMatch = value.match(/[\s\.]+$/g);
      //Check if the object exists
      var knownObject = objectNameMatch ? schema.rootType.fieldNameMap[objectNameMatch[0].toLowerCase()] : null;
      var result = {
        canTransit: !!knownObject,
        state: 'object',
        mustTransit: !!forceObjectTerminationMatch
      };
      result.value = result.canTransit ? knownObject.name : '';
      return result;
    }
    var propertyNameMatch = value.match(/[a-z_]{1}[a-z0-9_]{0,}/i);
    var forcePropertyTerminationMatch = value.match(/[^a-z0-9_]+$/i);
    if (!currentState.hasProperty) {
      //For now we allow any property name (as long as it is syntactically valid)
      //Otherwise this is the place to add check that property belongs to a specific type
      return {
        canTransit: !!propertyNameMatch,
        state: 'property',
        value: propertyNameMatch[0],
        mustTransit: !!forcePropertyTerminationMatch
      }
    }
    if (!currentState.hasOperator) {
      var operatorNameMatch = value.match(/\S+/g);
      var operatorNameMatchValue = operatorNameMatch ? operatorNameMatch.join(' ').toLowerCase() : '';
      var looseMatchOperators = operatorNameMatch ? operators.filter(function (item) { return item.searchValue.startsWith(value); }) : [];
      var strictMatchOperator = operatorNameMatch ? operators.find(function (item) { return item.searchValue === operatorNameMatchValue; }) : null;
      var forceOperatorTerminationMatch = value.match(/\s$/);
      //It means that we found the exact operator
      if (strictMatchOperator) {
        return {
          canTransit: true,
          state: 'operator',
          value: strictMatchOperator.value,
          //It means that we must terminate operator if there is only one choice
          //Otherwise (e.g. we entered '<' but it can be '<' or '<=') we are not forced to make a transition
          mustTransit: looseMatchOperators.length <= 1 && forceOperatorTerminationMatch
        };
      }
      //It means that we haven't found the exact operator, but some of operators start from the value so we'll be able to terminate later
      //E.g. we entered 'not' which may later result in 'not like' operator but is no operator by itself
      var mayBeOperator = looseMatchOperators.length > 0;
      //Now we check if property can be terminated
      return {
        canTransit: !!propertyNameMatch,
        state: 'property',
        value: propertyNameMatch ? propertyNameMatch[0] : value,
        mustTransit: mayBeOperator ? false : !!propertyNameMatch && !!forcePropertyTerminationMatch
      }
    }
    //Any string (even an empty one) can be a valid string value
    //Non-string values can allow only non-empty values
    //If we don't know for sure the type, we allow empty value
    //The only notable thing here is that we check whether we should escape the value with apstrophs      
    var operatorName = tokens.find(function (token) { return token.type === 'operator'; }).value.trim();
    var operator = operators.find(function (item) { return item.value === operatorName; });
    var isString = operator.supportedTypes === 'STRING,TEXTAREA,EMAIL';
    if (!isString) {
      var lastPropertyToken = null;
      for (var index = tokens.length - 1; index >= 0; index--) {
        lastPropertyToken = tokens[index];
        if (lastPropertyToken.type === 'property') {
          break;
        }
      }
      isString = _typeHasStringValue(lastPropertyToken.propertyType);
    }
    return {
      canTransit: isString || value.trim(),
      state: 'value',
      value: isString && value.match(/^'.*'&/) ? '\'' + value + '\'' : value.trim(),
      mustTransit: false
    };
  };

  var _performTransition = function (currentState, transition, schema, tokens) {
    switch (transition.state) {
      case 'object':
        currentState.hasObject = true;
        tokens.push({
          type: 'property',
          value: transition.value,
          propertyType: schema.rootType.fieldNameMap[transition.value.toLowerCase()].propertyType,
          parentPropertyType: '$global'
        });
        break;
      case 'property':
        currentState.hasObject = true;
        currentState.hasProperty = true;
        var lastPropertyToken = tokens.findLast(function (token) { return token.type === 'property'; });
        var parentType = lastPropertyToken ? schema.typeNameMap[lastPropertyToken.propertyType] : schema.rootType;
        var property = parentType ? parentType.fieldNameMap[transition.value.toLowerCase()] : null;
        var value = property ? property.name : transition.value;
        tokens.push({
          type: 'property',
          value: value,
          propertyType: property ? property.type : '',
          parentPropertyType: parentType ? parentType.name : ''
        });
        break;
      case 'operator':
        currentState.hasObject = true;
        currentState.hasProperty = true;
        currentState.hasOperator = true;
        tokens.push({
          type: 'operator',
          value: transition.value,
        });
        break;
      case 'value':
        currentState.hasObject = true;
        currentState.hasProperty = true;
        currentState.hasOperator = true;
        currentState.hasValue = true;
        var valueToken = tokens.find(function (token) { return token.type === 'value'; });
        if (!valueToken) {
          valueToken = {
            type: 'value'
          };
          tokens.push(valueToken);
        }
        valueToken.value = transition.value;
        break;
    }
  };

  var _createState = function (schema) {
    return {
      hasObject: schema.rootType.name !== '$global',
      hasProperty: false,
      hasOperator: false,
      hasValue: false,
      isValid: function () {
        return this.hasObject && this.hasProperty && this.hasOperator && this.hasValue;
      }
    };
  };

  var _tracebackPropertyTypes = function (subExpression, schema) {
    //If we know the type of the very first property - we don't need to identify all other property types
    if (subExpression.tokens[0].propertyType) {
      return;
    }
    var valueToken = subExpression.tokens.findLast(function (token) { return token.type === 'value'; });
    var value = valueToken.value || '';
    var currentPropertyTypes = [];
    if (value.match(/^'.*'$/)) {
      value = value.substring(1, value.length - 1) || '';
      currentPropertyTypes.push('STRING', 'TEXTAREA', 'EMAIL');
    } else if (['true', 'false'].includes(value.toLowerCase())) {
      currentPropertyTypes.push('BOOLEAN');
    }
    var allPropertyTypes = [];
    var propertyTokens = subExpression.tokens.filter(function (token) { return token.type === 'property'; });
    for (var index = propertyTokens.length - 1; index >= 0; index--) {
      allPropertyTypes.unshift(currentPropertyTypes.slice());
      //This is for the case, where property name matches the type name. We assume that this type is the one to pick
      //E.g. we have property path '$Record.Account.AccountNumber'. We found out that 'AccountNumber' property may belong to 'Type1','Type2' or 'Account'
      //Since 'Account' type matches the parent 'Account' property, than we take just this type
      if (currentPropertyTypes.includes(propertyTokens[index].value)) {
        allPropertyTypes[0] = [propertyTokens[index].value];
        currentPropertyTypes = [propertyTokens[index].value];
        //continue;
      }
      var propertyName = propertyTokens[index].value.toLowerCase();
      currentPropertyTypes = schema.typeList.filter(function (type) {
        //We are looking for the types, that have property with specific name (and optionally of specific types)
        return type.fieldNameMap.hasOwnProperty(propertyName)
          && (!type.fieldNameMap[propertyName].type || currentPropertyTypes.length > 0 ? currentPropertyTypes.includes(type.fieldNameMap[propertyName].type) : true);
      }).map(function (type) { return type.name; });
    }
    //After we are done with this, our allPropertyTypes will contain possible types for each property
    //E.g. for a path $Record.Account.AccountNumber == 'Some Value' it could look like this (not necessary)
    //AccountNumber - [STRING] (because values is surrounded by aposrophes)
    //Account - [Account, Case, Contract, Lead] (Account will be taken actually because its name matches the name of the property)
    //$Record - [Case, Contract, Lead]
    //Now we loop through the tokens and trying to associate specific type to it
    //Since we don't care about the real type, we can just take the first one
    for (var index = 0; index < propertyTokens.length; index++) {
      var currentPropertyToken = propertyTokens[index];
      var parentPropertyTypeName = currentPropertyToken.parentPropertyType;
      var parentPropertyType = parentPropertyTypeName ? schema.typeNameMap[parentPropertyTypeName] : null;
      var possiblePropertyTypes = allPropertyTypes[index];
      //First we check, if our parent type has a property with the specific name
      var currentProperty = parentPropertyType ? parentPropertyType.fieldNameMap[currentPropertyToken.value.toLowerCase()] : null;
      if (currentProperty && currentProperty.type) {
        currentPropertyToken.propertyType = currentProperty.type;
        //It means that don't know the type of current property for sure and should guess it
      } else if (possiblePropertyTypes.length > 0) {
        currentPropertyToken.propertyType = possiblePropertyTypes[0];
      }
      if (index != propertyTokens.length - 1) {
        var nextPropertyToken = propertyTokens[index + 1];
        nextPropertyToken.parentPropertyType = currentPropertyToken.propertyType;
      }
    }
  };

  return {
    operators: [
      {
        value: '=',
        description: 'equals',
        searchValue: '=',
        supportedTypes: 'ALL'
      },
      {
        value: '!=',
        description: 'not equals',
        searchValue: '!=',
        supportedTypes: 'ALL'
      },
      {
        value: '<',
        description: 'less than',
        searchValue: '<',
        supportedTypes: 'ALL'
      },
      {
        value: '<=',
        description: 'less than or equals',
        searchValue: '<=',
        supportedTypes: 'ALL'
      },
      {
        value: '>',
        description: 'greater than',
        searchValue: '>',
        supportedTypes: 'ALL'
      },
      {
        value: '>=',
        description: 'greater than or equals',
        searchValue: '>=',
        supportedTypes: 'ALL'
      },
      {
        value: 'LIKE',
        description: 'similar to',
        searchValue: 'like',
        supportedTypes: 'STRING,TEXTAREA,EMAIL'
      },
      {
        value: 'NOT LIKE',
        description: 'not similar to',
        searchValue: 'not like',
        supportedTypes: 'STRING,TEXTAREA,EMAIL'
      }
    ],

    typeHasStringValue: _typeHasStringValue,

    createNewSubExpression: function (schema) {
      var result = { tokens: [] };
      result.currentState = _createState(schema);
      result.toString = function () {
        if (!this.currentState.isValid()) {
          return '';
        }
        var propertyPath = this.tokens.filter(function (token) { return token.type === 'property'; })
          .map(function (token) { return token.value; })
          .join('.');
        var operator = this.tokens.find(function (token) { return token.type === 'operator'; }).value;
        var value = this.tokens.find(function (token) { return token.type === 'value'; }).value;
        return propertyPath + ' ' + operator + ' ' + value;
      };
      return result;
    },

    processValue: function (value, currentState, schema, tokens, forceTransition) {
      var transition = _getTransition(currentState, schema, this.operators, value, tokens);
      if (transition.ignoreTransit) {
        return true;
      }
      if (transition.mustTransit || (transition.canTransit && forceTransition)) {
        _performTransition(currentState, transition, schema, tokens);
        return true;
      }
      return false;
    },

    parseExpression: function (expression, schema) {
      var result = [];
      if (!expression) {
        return result;
      }
      if (expression.toLowerCase().trim() === 'true') {
        return result;
      }
      var operators = this.operators;
      var subExpressions = expression.split(' OR ');
      var self = this;
      subExpressions.forEach(function (subExpressionString) {
        try {
          var subExpression = self.createNewSubExpression(schema);
          var currentState = subExpression.currentState;
          var tokens = subExpression.tokens;
          var currentValue = '';
          var previousValue = '';
          for (var index = 0; index < subExpressionString.length; index++) {
            currentValue = currentValue + subExpressionString.charAt(index);
            if (self.processValue(currentValue, currentState, schema, tokens)) {
              currentValue = '';
            }
            previousValue = currentValue;
          }
          if (currentValue) {
            var finalTransition = _getTransition(currentState, schema, operators, currentValue, tokens);
            if (finalTransition.canTransit) {
              _performTransition(currentState, finalTransition, schema, tokens);
            }
          }
          if (currentState.isValid()) {
            _tracebackPropertyTypes(subExpression, schema);
          }
          result.push(currentState.isValid() ? subExpression : null);
        }
        catch {
          result.push(null);
        }
      });
      result = result.some(function (item) { return !item; }) ? null : result;
      return result;
    }
  }
})()