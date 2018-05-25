({
    _getPlaceholder: function (currentState) {
        if (!currentState.hasObject) {
            return 'Enter name of the global object';
        }
        if (!currentState.hasProperty) {
            return 'Enter name of the propery';
        }
        if (!currentState.hasOperator) {
            return 'Enter name of the property or operation';
        }
        if (!currentState.hasValue) {
            return 'Enter value';
        }
        return 'Expression is complete';
    },

    init: function (cmp) {
        var subExpression = cmp.get('v.subExpression');
        var schema = cmp.get('v.schema');
        var strategy = cmp.get('v.strategy');
        var placeholder = this._getPlaceholder(subExpression.currentState);
        var lookup = this._generateLookup(expression, schema, strategy);
        cmp.set('v._placeholder', placeholder);
        cmp.set('v._lookup', lookup);
        cmp.set('v._filteredLookup', lookup);
    },

    handleValueChanged: function (cmp, value, forceTransition) {
        var subExpression = cmp.get('v.subExpression');
        var schema = cmp.get('v.schema');
        var searchValue = value.toLowerCase().trim();
        var lookup = cmp.get('v._lookup');
        cmp.set('v._filteredLookup', lookup.filter(function (item) { return item.searchValue.includes().trim(); }));
        //var valueIsProcessed = _expressionParser.processValue(value, subExpression.currentState, schema, subExpression.tokens, forceTransition);
        if (valueIsProcessed) {
            cmp.set('v.subExpression', subExpression);
            cmp.set('v._value', '');
            cmp.set('v._placeholder', this._getPlaceholder(subExpression.currentState));
        }
    },

    _generateLookup: function (expression, schema, strategy) {
        if (!expression.currentState.hasObject) {
            var result = schema.rootType.fieldList.map(function (field) {
                return {
                    header: field.name,
                    description: '- ' + field.label,
                    value: field.name,
                    searchValue: field.name.toLowerCase()
                };
            });
            //TODO: get external connections differently
            return result;
        }
        if (!expression.currentState.hasProperty) {
            var currentType = null;
            if (schema.rootType.name === '@global') {
                currentType = schema.rootType.fieldNameMap[expression.tokens[0].value].type;
                //It means that the type of current global is unknown. We'll ask user to select a type
                if (!currentType) {
                    return schema.typeList.map(function (type) {
                        return {
                            header: type.name,
                            description: '- ' + type.label,
                            value: type.name,
                            searchValue: type.name.toLowerCase()
                        };
                    })
                }
            } else {
                //It means that we use implicit object ($Item, in our case it will always be of type Proposition)
                currentType = schema.rootType;
            }
            return currentType.fieldList.map(function (field) {
                return {
                    header: field.name,
                    description: '- ' + field.label,
                    value: field.name,
                    details: 'of type ' + field.type,
                    searchValue: field.name.toLowerCase() + '|' + field.type.toLowerCase()
                };
            });
        }
        if (!expression.currentState.hasOperator) {
            //We check the type of last entered property. If it is a reference type we allow user to pick a subproperty
            var lastPropertyToken = expression.tokens.findLast(function (token) { return token.type === 'property'; });
            var lastPropertyParentType = schema.typeNameMap[lastPropertyToken.parentPropertyType];
            var allowSubProperties = false;
            if (lastPropertyParentType) {
                var lastPropertyType = lastPropertyParentType.fieldNameMap[lastPropertyToken.name]
                allowSubProperties = lastPropertyType.isReference;
            }
            var lastPropertyType = schema.typeNameMap[lastPropertyToken.propertyType];
            if (allowSubProperties && lastPropertyType) {
                return lastPropertyType.fieldList.map(function (field) {
                    return {
                        header: field.name,
                        description: '- ' + field.label,
                        value: field.name,
                        details: 'of type ' + field.type,
                        searchValue: field.name.toLowerCase() + '|' + field.type.toLowerCase()
                    };
                });
            }
            return _expressionParser.operators
                .filter(function (operator) { return operator.supportedTypes === 'ALL' || operator.supportedTypes.includes(lastPropertyTokens.propertyType); })
                .map(function (operator) {
                    return {
                        header: operator.value,
                        description: '- ' + operator.description,
                        value: operator.value,
                        searchValue: operator.value + '|' + operator.description
                    }
                });
        }
        //TODO: add available functions depending on the property type
        return [];
    }
})
