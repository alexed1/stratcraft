({
    _getPlaceholder: function (subExpression, schema) {
        if (!subExpression.currentState.hasObject) {
            return 'Select the object, this expression will be based on. Start typing to filter the list';
        }
        if (!subExpression.currentState.hasProperty) {
            var propertyToken = subExpression.tokens.findLast(function (token) { return token.type === 'property'; });
            if (propertyToken && !propertyToken.propertyType) {
                return 'What object do you expect this to be? Start typing to filter the list';
            }
            return 'Select property. Start typing to filter the list';
        }
        if (!subExpression.currentState.hasOperator) {
            //This if for the case where last selected property is a reference type
            var propertyToken = subExpression.tokens.findLast(function (token) { return token.type === 'property'; });
            if (propertyToken && schema.typeNameMap.hasOwnProperty(propertyToken.propertyType)) {
                return 'Select  property. Start typing to filter the list';
            }
            return 'Select operator. Start typing to filter the list';
        }
        if (!subExpression.currentState.hasValue) {
            return 'Enter value';
        }
        return 'Expression is complete. Type and press ENTER to update value';
    },

    updatePopupLocation: function (cmp) {
        var popupHost = cmp.find('popup-host').getElement();
        var popup = popupHost.getElementsByClassName('popup')[0];
        var coordinates = popupHost.getBoundingClientRect();
        //var left = popupHost.offsetLeft + popupHost.closest('.sub-exp-list-container').offsetLeft;
        popup.style.left = 32 + 'px';
        popup.style.top = coordinates.top + 'px';
        popup.style.width = coordinates.width + 'px';
    },

    init: function (cmp) {
        var subExpression = cmp.get('v.subExpression');
        var schema = cmp.get('v.schema');
        var strategy = cmp.get('v.strategy');
        var placeholder = this._getPlaceholder(subExpression, schema);
        var lookup = this._generateLookup(subExpression, schema, strategy);
        cmp.set('v._placeholder', placeholder);
        cmp.set('v._lookup', lookup);
        cmp.set('v._filteredItems', lookup.items);
    },

    processLookupItem: function (cmp, lookupItem, targetState) {
        var self = this;
        var strategy = cmp.get('v.strategy');
        var subExpression = cmp.get('v.subExpression');
        var schema = cmp.get('v.schema');
        var currentState = subExpression.currentState;
        var tokens = subExpression.tokens;
        switch (targetState) {
            case 'object':
                tokens.push({
                    type: 'property',
                    value: lookupItem,
                    propertyType: schema.rootType.fieldNameMap[lookupItem.toLowerCase()].type,
                    parentPropertyType: '$global'
                });
                currentState.hasObject = true;
                break;
            case 'objectType':
                var propertyToken = tokens[0];
                //Uncomment, if you want a pick of type to work for all subexpressions
                // var property = schema.rootType.fieldNameMap[propertyToken.value.toLowerCase()];
                // property.type = lookupItem;
                propertyToken.propertyType = lookupItem;
                break;
            case 'property':
                var propertyToken = tokens.findLast(function (token) { return token.type === 'property'; });
                var parentPropertyTypeName = propertyToken ? propertyToken.propertyType : schema.rootType.name;
                var parentPropertyType = schema.typeNameMap[parentPropertyTypeName];
                tokens.push({
                    type: 'property',
                    value: lookupItem,
                    propertyType: parentPropertyType.fieldNameMap[lookupItem.toLowerCase()].type,
                    parentPropertyType: parentPropertyType.name
                });
                currentState.hasProperty = true;
                break;
            case 'operator':
                tokens.push({
                    type: 'operator',
                    value: lookupItem
                });
                currentState.hasOperator = true;
                break;
            case 'value':
                var propertyToken = tokens.findLast(function (token) { return token.type === 'property'; });
                var valueToken = tokens.findLast(function (token) { return token.type === 'value'; });
                if (!valueToken) {
                    valueToken = {
                        type: 'value',
                    };
                    tokens.push(valueToken);
                }
                valueToken.value = _expressionParser.typeHasStringValue(propertyToken.propertyType) ? '\'' + lookupItem + '\'' : lookupItem;
                currentState.hasValue = true;
                break;
        }
        cmp.set('v.subExpression', subExpression);
        cmp.set('v._value', '');
        var placeholder = this._getPlaceholder(subExpression, schema);
        var lookup = this._generateLookup(subExpression, schema, strategy);
        cmp.set('v._placeholder', placeholder);
        cmp.set('v._lookup', lookup);
        this._scrollPopupTop(cmp);
        cmp.set('v._filteredItems', lookup.items);
        cmp.set('v._index', lookup.items.length === 0 ? -1 : 0);
        // window.setTimeout($A.getCallback(function () {
        //     self._scrollPopupTop(cmp);
        // }), 100);
    },

    _scrollPopupTop: function (cmp) {
        var popup = cmp.find('popup').getElement();
        popup.scrollTop = 0;
    },

    _generateLookup: function (expression, schema, strategy) {
        if (!expression.currentState.hasObject) {
            var result = schema.rootType.fieldList.map(function (field) {
                return {
                    header: field.label,
                    details: field.name,
                    value: field.name,
                    searchValue: field.name.toLowerCase()
                };
            });
            result.sort(function (x, y) { return x.header.localeCompare(y.header); });
            //TODO: get external connections differently
            return {
                items: result,
                targetState: 'object',
                mode: 'select'
            };
        }
        if (!expression.currentState.hasProperty) {
            var currentType = null;
            if (schema.rootType.name === '$global') {
                var currentTypeName = expression.tokens[0].propertyType;
                currentType = currentTypeName ? schema.typeNameMap[currentTypeName] : null;
                //It means that the type of current global is unknown. We'll ask user to select a type
                if (!currentType) {
                    //We don't allow user to pick global and external connection types
                    var typeList = schema.typeList.filter(function (type) { return !type.name.startsWith('$'); })
                        .map(function (type) {
                            return {
                                header: type.name,
                                description: '- ' + type.label,
                                value: type.name,
                                searchValue: type.name.toLowerCase()
                            };
                        });
                    typeList.sort(function (x, y) { return x.header.localeCompare(y.header); });
                    return {
                        items: typeList,
                        targetState: 'objectType',
                        mode: 'select'
                    };
                }
            } else {
                //It means that we use implicit object ($Item, in our case it will always be of type Proposition)
                currentType = schema.rootType;
            }
            var fieldList = currentType.fieldList.map(function (field) {
                return {
                    header: field.name + (field.isReference ? ' >' : ''),
                    description: '- ' + field.label,
                    value: field.name,
                    details: 'of type ' + field.type,
                    searchValue: field.name.toLowerCase() + '|' + field.type.toLowerCase(),
                    isReference: field.isReference
                };
            });
            fieldList.sort(function (x, y) {
                if (x.isReference && !y.isReference) {
                    return -1;
                }
                if (!x.isReference && y.isReference) {
                    return 1;
                }
                return x.header.localeCompare(y.header);
            });
            return {
                items: fieldList,
                targetState: 'property',
                mode: 'select'
            };
        }
        if (!expression.currentState.hasOperator) {
            //We check the type of last entered property. If it is a reference type we allow user to pick a subproperty
            var lastPropertyToken = expression.tokens.findLast(function (token) { return token.type === 'property'; });
            var lastPropertyParentType = schema.typeNameMap[lastPropertyToken.parentPropertyType];
            var allowSubProperties = false;
            if (lastPropertyParentType) {
                var lastPropertyType = lastPropertyParentType.fieldNameMap[lastPropertyToken.value.toLowerCase()]
                allowSubProperties = lastPropertyType.isReference;
            }
            var lastPropertyType = schema.typeNameMap[lastPropertyToken.propertyType];
            if (allowSubProperties && lastPropertyType) {
                var fieldList = lastPropertyType.fieldList.map(function (field) {
                    return {
                        header: field.name + (field.isReference ? ' >' : ''),
                        description: '- ' + field.label,
                        value: field.name,
                        details: 'of type ' + field.type,
                        searchValue: field.name.toLowerCase() + '|' + field.type.toLowerCase(),
                        isReference: field.isReference
                    };
                });
                fieldList.sort(function (x, y) {
                    if (x.isReference && !y.isReference) {
                        return -1;
                    }
                    if (!x.isReference && y.isReference) {
                        return 1;
                    }
                    return x.header.localeCompare(y.header);
                });
                return {
                    items: fieldList,
                    targetState: 'property',
                    mode: 'select'
                };
            }
            var operators = _expressionParser.operators
                .filter(function (operator) { return operator.supportedTypes === 'ALL' || operator.supportedTypes.includes(lastPropertyToken.propertyType); })
                .map(function (operator) {
                    return {
                        header: operator.value,
                        description: '- ' + operator.description,
                        value: operator.value,
                        searchValue: operator.value.toLowerCase() + '|' + operator.description.toLowerCase()
                    }
                });
            return {
                items: operators,
                targetState: 'operator',
                mode: 'select'
            };
        }
        //TODO: add available functions depending on the property type
        return {
            items: [],
            targetState: 'value',
            mode: 'suggest'
        };
    }
})
