({
    initOperatorsLookup: function (cmp) {
        cmp.set('v._operatorLookup', [
            {
                header: '=',
                headerDetails: '- equals',
                subHeader: 'operator',
                searchValue: '=',
                stringOnly: false
            },
            {
                header: '!=',
                headerDetails: '- not equals',
                subHeader: 'operator',
                searchValue: '!=',
                stringOnly: false
            },
            {
                header: '>',
                headerDetails: '- greater than',
                subHeader: 'operator',
                searchValue: '>',
                stringOnly: false
            },
            {
                header: '<',
                headerDetails: '- less than',
                subHeader: 'operator',
                searchValue: '<',
                stringOnly: false
            },
            {
                header: '>=',
                headerDetails: '- greater than or equals',
                subHeader: 'operator',
                searchValue: '>=',
                stringOnly: false
            },
            {
                header: '<=',
                headerDetails: '- less than or equals',
                subHeader: 'operator',
                searchValue: '<=',
                stringOnly: false
            },
            {
                header: 'LIKE',
                headerDetails: '- similar (strings only)',
                subHeader: 'operator',
                searchValue: 'like',
                stringOnly: true
            },
            {
                header: 'NOT LIKE',
                headerDetails: '- not similar (string only)',
                subHeader: 'operator',
                searchValue: 'not like',
                stringOnly: true
            }
        ]);
    },

    _getPlaceholder: function (hasObject, hasProperty, hasOperator, hasValue) {
        if (!hasObject) {
            return 'Enter name of the global object';
        }
        if (!hasProperty) {
            return 'Enter name of the propery';
        }
        if (!hasOperator) {
            return 'Enter name of the property or operation';
        }
        if (!hasValue) {
            return 'Enter value';
        }
        return 'Expression is complete';
    },

    _getLookup: function (tokens, schema) {
        var lastToken = tokens.length == 0 ? null : tokens[tokens.length - 1];
        var resultFields = [];
        if (lastToken) {
            if (lastToken.type === 'value' || lastToken.type === 'operator') {
                resultFields = [];
            } else {
                resultFields = lastToken.parentType && schema.typeNameMap.hasOwnProperty(lastToken.parentType)
                    ? schema.typeNameMap[lastToken.parentType].fieldList
                    : schema.rootType.fieldList;
            }
        } else {
            resultFields = schema.rootType.fieldList;
        }
        var result = resultFields.map(function (field) {
            return {
                header: field.name,
                headerDetails: ' - ' + field.label,
                subHeader: schema.rootType.name
            }
        });
        return result;
    },

    init: function (cmp) {
        var subExpression = cmp.get('v.subExpression');
        var schema = cmp.get('v.schema');
        var propertyTokens = subExpression.properties.map(function (item) {
            return {
                type: 'property',
                value: item.name,
                propertyType: item.type,
                parentPropertyType: item.parentType
            }
        });
        var operatorToken = null;
        if (subExpression.operator) {
            operatorToken = {
                type: 'operator',
                value: ' ' + subExpression.operator + ' ',
            };
        }
        var valueToken = null;
        if (subExpression.value) {
            valueToken = {
                type: 'value',
                value: subExpression.value
            };
        }
        var allTokens = [];
        var hasObject = schema.rootType.name !== '@global';
        var hasProperty = false;
        var hasOperator = operatorToken;
        var hasValue = valueToken;
        if (propertyTokens.length > 0) {
            hasProperty = hasObject || propertyTokens.length > 1;
            hasObject = true;
        };
        allTokens = propertyTokens;
        if (hasOperator) {
            allTokens.push(operatorToken);
        }
        if (hasValue) {
            allTokens.push(valueToken);
        }
        var placeholder = this._getPlaceholder(hasObject, hasProperty, hasOperator, hasValue);
        var lookup = this._getLookup(allTokens, schema);
        cmp.set('v._hasObject', hasObject);
        cmp.set('v._hasProperty', hasProperty);
        cmp.set('v._hasOperator', hasOperator);
        cmp.set('v._hasValue', hasValue);
        cmp.set('v._placeholder', placeholder);
        cmp.set('v._tokens', allTokens);
        cmp.set('v._lookup', lookup);
        cmp.set('v._filteredLookup', lookup);
    },

    getTransition: function (cmp, value) {
        var hasObject = cmp.get('v._hasObject');
        var schema = cmp.get('v.schema');
        value = value || '';
        if (!hasObject) {
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
        var hasProperty = cmp.get('v._hasProperty');
        var propertyNameMatch = value.match(/[a-z_]{1}[a-z0-9_]{0,}/i);
        var forcePropertyTerminationMatch = value.match(/[\s\.]+$/g);
        if (!hasProperty) {
            //For now we allow any property name (as long as it is syntactically valid)
            //Otherwise this is the place to add check that property belongs to a specific type
            return {
                canTransit: !!propertyNameMatch,
                state: 'property',
                value: propertyNameMatch[0],
                mustTransit: !!forcePropertyTerminationMatch
            }
        }
        var hasOperator = cmp.get('v._hasOperator');
        var operatorLookup = cmp.get('v._operatorLookup');
        if (!hasOperator) {
            var operatorNameMatch = value.match(/\S+/g);
            var operatorNameMatchValue = operatorNameMatch ? operatorNameMatch.join(' ').toLowerCase() : '';
            var looseMatchOperators = operatorNameMatch ? operatorLookup.filter(function (item) { return item.searchValue.includes(operatorNameMatchValue); }) : [];
            var strictMatchOperator = operatorNameMatch ? operatorLookup.find(function (item) { return item.searchValue === operatorNameMatchValue; }) : null;
            var forceOperatorTerminationMatch = value.match(/\s$/);
            //It means that we found the exact operator
            if (strictMatchOperator) {
                return {
                    canTransit: true,
                    state: 'operator',
                    value: strictMatchOperator.header,
                    //It means that we must terminate operator if there is only one choice
                    //Otherwise (e.g. we entered '<' but it can be '<' or '<=') we are not forced to make a transition
                    mustTransit: looseMatchOperators.length <= 1
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
        var tokens = cmp.get('v._tokens');
        var operatorName = tokens.find(function (token) { return token.type === 'operator'; }).value.trim();
        var operator = operatorLookup.find(function (item) { return item.header === operatorName; });
        var isString = operator.stringOnly;
        if (!isString) {
            var lastPropertyToken = null;
            for (var index = tokens.length - 1; index >= 0; index--) {
                lastPropertyToken = tokens[index];
                if (lastPropertyToken.type === 'property') {
                    break;
                }
            }
            isString = lastPropertyToken.propertyType === 'STRING';
        }
        return {
            canTransit: isString || value.trim(),
            state: 'value',
            value: isString ? '\'' + value + '\'' : value.trim(),
            mustTransit: false
        };
    },

    performTransition: function (cmp, transition) {
        var hasObject = false;
        var hasProperty = false;
        var hasOperator = false;
        var hasValue = false;
        var tokens = cmp.get('v._tokens');
        var schema = cmp.get('v.schema');
        switch (transition.state) {
            case 'object':
                hasObject = true;
                tokens.push({
                    type: 'property',
                    value: transition.value,
                    propertyType: schema.rootType.fieldNameMap[transition.value.toLowerCase()].propertyType,
                    parentPropertyType: '@global'
                });
                break;
            case 'property':
                hasObject = true;
                hasProperty = true;
                var lastPropertyToken = null;
                for (var index = tokens.length - 1; index >= 0; index--) {
                    lastPropertyToken = tokens[index];
                    if (lastPropertyToken.type === 'property') {
                        break;
                    }
                }
                var parentType = lastPropertyToken ? lastPropertyToken.propertyType : schema.rootType.name;
                var property = parentType ? parentType.fieldNameMap[transition.value.toLowerCase()] : null;
                var value = property ? property.name : transition.value;
                tokens.push({
                    type: 'property',
                    value: value,
                    propertyType: property ? property.type : '',
                    parentTPropertyType: parentType ? parentType.name : ''
                });
                break;
            case 'operator':
                hasObject = true;
                hasProperty = true;
                hasOperator = true;
                tokens.push({
                    type: 'operator',
                    value: transition.value,
                });
                break;
            case 'value':
                hasObject = true;
                hasProperty = true;
                hasOperator = true;
                hasValue = true;
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
        var placeholder = this._getPlaceholder(hasObject, hasProperty, hasOperator, hasValue);
        cmp.set('v._hasObject', hasObject);
        cmp.set('v._hasProperty', hasProperty);
        cmp.set('v._hasOperator', hasOperator);
        cmp.set('v._hasvalue', hasValue);
        cmp.set('v._tokens', tokens);
        cmp.set('v._value', '');
        cmp.set('v._placeholder', placeholder);

    },

    handleValueChanged: function (cmp, value) {
        var transition = this.getTransition(cmp, value);
        if (transition.mustTransit) {
            this.performTransition(cmp, transition);
        }
    }
})
