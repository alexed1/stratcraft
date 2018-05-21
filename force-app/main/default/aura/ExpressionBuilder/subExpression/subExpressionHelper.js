({
    initOperatorsLookup: function (cmp) {
        cmp.set('v._operatorLookup', [
            {
                header: '=',
                headerDetails: '- equals',
                subHeader: 'operator'
            },
            {
                header: '!=',
                headerDetails: '- not equals',
                subHeader: 'operator'
            },
            {
                header: '>',
                headerDetails: '- greater than',
                subHeader: 'operator'
            },
            {
                header: '<',
                headerDetails: '- less than',
                subHeader: 'operator'
            },
            {
                header: '>=',
                headerDetails: '- greater than or equals',
                subHeader: 'operator'
            },
            {
                header: '<=',
                headerDetails: '- less than or equals',
                subHeader: 'operator'
            },
            {
                header: 'LIKE',
                headerDetails: '- similar (strings only)',
                subHeader: 'operator'
            },
            {
                header: 'NOT LIKE',
                headerDetails: '- not similar (string only)',
                subHeader: 'operator'
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

    getValueCommitStatus: function (cmp, value, normalizedValue) {
        var hasValue = cmp.get('v._hasValue');
        var hasOperator = cmp.get('v._hasOperator');
        if (hasValue || hasOperator) {
            //TODO: add property type check
            return 'can';
        }
        if (!normalizedValue) {
            return '';
        }
        var hasProperty = cmp.get('v._hasProperty');
        if (hasProperty) {
            var operatorLookup = cmp.get('v._operatorLookup');
            var knownOperator = operatorLookup.find(function (operator) { return operator.header === normalizedValue; });
            var similarOperator = operatorLookup.find(function (operator) {
                return operator.header !== normalizedValue && operator.header.startsWith(normalizedValue);
            });
            if (knownOperator) {
                return similarOperator ? 'can' : 'must';
            }
            var nameIsValid = normalizedValue.match(/^[a-z_0-9]+$/i);
            if (!nameIsValid) {
                return '';
            }
            return value.match(/[\s\.]$/)
                ? similarOperator ? 'can' : 'must'
                : 'must';
        }
        normalizedValue = normalizedValue.endsWith('.') ? normalizedValue.substr(0, normalizedValue.length - 1) : normalizedValue;
        var hasObject = cmp.get('v._hasObject');
        if (hasObject) {
            var nameIsValid = normalizedValue.match(/^[a-z_0-9]+$/i);
            if (!nameIsValid) {
                return '';
            }
            return value.match(/[\s\.]$/)
                ? 'must'
                : 'can';
        }
        var schema = cmp.get('v.schema');
        var globalObject = schema.rootType.fieldList.find(function (field) { return field.name.toUpperCase() === normalizedValue; });
        return globalObject
            ? value.match(/[\s\.]$/) ? 'must' : 'can'
            : '';
    },

    commitValue: function (cmp, value, normalizedValue) {
        var hasValue = cmp.get('v._hasValue');
        var hasOperator = cmp.get('v._hasOperator');
        var hasProperty = cmp.get('v._hasProperty');
        var tokens = cmp.get('v._tokens');
        var hasObject = true;
        if (hasValue || hasOperator) {
            var valueToken = tokens.find(function (token) { return token.type === 'value'; });
            if (!valueToken) {
                valueToken = {
                    type: 'value',
                    value: value
                };
                tokens.push(valueToken);
            }
            valueToken.value = value;
            hasValue = true;
        } else if (hasProperty) {
            var operatorToken = tokens.find(function (token) { return token.operator === 'operator'; });
            if (!operatorToken) {
                tokens.push({
                    type: 'operator',
                    value: normalizedValue
                });
            }
            hasOperator = true;
        } else {
            normalizedValue = value.trim();
            normalizedValue = normalizedValue.endsWith('.') ? normalizedValue.substr(0, normalizedValue.length - 1) : normalizedValue;
            var propertyToken = {
                type: 'property',
                value: normalizedValue
            };
            var lastPropertyToken = null;
            tokens.forEach(function (token) {
                if (token.type === 'property') {
                    lastPropertyToken = token;
                }
            });
            var schema = cmp.get('v.schema');
            if (lastPropertyToken) {
                propertyToken.parentPropertyType = lastPropertyToken.propertyType;
            } else {
                propertyToken.parentPropertyType = schema.rootType.name;
            }
            if (propertyToken.parentPropertyType) {
                var type = schema.typeNameMap[propertyToken.parentPropertyType];
                propertyToken.propertyType = type.fieldNameMap[propertyToken.value] || ''
            } else {
                propertyToken.propertyType = '';
            }
            tokens.push(propertyToken);
            hasProperty = true;
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
        var normalizedValue = value.trim().toUpperCase();
        var valueCommitStatus = this.getValueCommitStatus(cmp, value, normalizedValue);
        if (valueCommitStatus === 'must') {
            this.commitValue(cmp, value);
        }
    }
})
