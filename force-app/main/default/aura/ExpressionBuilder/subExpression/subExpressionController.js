({
    handleValueChanged: function (cmp, event, helper) {
        var subExpression = cmp.get('v.subExpression');
        var schema = cmp.get('v.schema');
        var value = cmp.get('v._value');
        var searchValue = value.toLowerCase().trim();
        var lookup = cmp.get('v._lookup');
        var filteredItems = lookup.items.filter(function (item) { return item.searchValue.includes(searchValue); });
        cmp.set('v._filteredItems', filteredItems);
        cmp.set('v._index', filteredItems.length === 0 ? -1 : 0);
    },

    handleInputKeyDown: function (cmp, event, helper) {
        var index = cmp.get('v._index');
        var filteredItems = cmp.get('v._filteredItems');
        var noLookupItem = index === -1 || filteredItems.length === 0;
        var newIndex = -1;
        switch (event.keyCode) {
            //Enter
            case 13:
                event.preventDefault();
                helper.processLookupItem(cmp, noLookupItem ? cmp.get('v._value') : filteredItems[index].value, cmp.get('v._lookup.targetState'));
                return;
            //Escape
            case 27:
                var previousSubExpression = cmp.get('v._previousSubExpression');
                if (previousSubExpression) {
                    cmp.set('v._previousSubExpression', null);
                    cmp.set('v.subExpression.tokens', previousSubExpression.tokens);
                    cmp.set('v.subExpression.currentState', previousSubExpression.currentState);
                    helper.init(cmp);
                    event.preventDefault();
                    event.stopPropagation();
                }
                return;
            //Up arrow
            case 38:
                if (noLookupItem) {
                    return;
                }
                newIndex = index === 0 ? filteredItems.length - 1 : index - 1;
                break;
            //Down arrow
            case 40:
                if (noLookupItem) {
                    return;
                }
                newIndex = index === filteredItems.length - 1 ? 0 : index + 1;
                break;
        }
        if (newIndex !== -1) {
            cmp.set('v._index', newIndex);
            var popupHost = cmp.find('popup-host').getElement();
            var newSelectedView = popupHost.getElementsByClassName('lookup-item')[newIndex];
            newSelectedView.scrollIntoViewIfNeeded();
        }
    },

    handleFocus: function (cmp, event, helper) {
        var input = cmp.find('input');
        input.focus();
    },

    handleInputFocus: function (cmp, event, helper) {
        var lookup = cmp.get('v._lookup');
        if (!lookup || !lookup.items || lookup.items.length === 0) {
            cmp.set('v._isPopupOpen', false);
            return;
        }
        cmp.set('v._isPopupOpen', true);
        var resize = function (event) {
            $A.getCallback(function () { helper.updatePopupLocation(cmp); })();
        }
        var windowClick = function (event) {
            if (event.target) {
                var popupInput = event.target.closest('.popup-input');
                if (popupInput && popupInput.dataset.index == cmp.get('v.subExpressionIndex')) {
                    return;
                }
                var lookupItemVisual = event.target.closest('.lookup-item');
                if (lookupItemVisual) {
                    return;
                }
            }
            window.removeEventListener('click', windowClick);
            window.removeEventListener('resize', resize);
            window.setTimeout($A.getCallback(function () { cmp.set('v._isPopupOpen', false); }));
        };
        window.removeEventListener('resize', resize);
        window.addEventListener('resize', resize);
        window.removeEventListener('click', windowClick);
        window.addEventListener('click', windowClick);
    },

    handleTokenClick: function (cmp, event, helper) {
        var tokenIndex = parseInt(event.target.dataset.index);
        var subExpression = cmp.get('v.subExpression');
        var previousSubExpression = cmp.get('v._previousSubExpression');
        if (!previousSubExpression) {
            cmp.set('v._previousSubExpression', _utils.clone(subExpression, true));
        }
        var schema = cmp.get('v.schema');
        var token = subExpression.tokens[tokenIndex];
        var targetState;
        var previousPropertyToken = tokenIndex === 0 ? null : subExpression.tokens[tokenIndex - 1];
        switch (token.type) {
            case 'value':
                subExpression.currentState.hasValue = false;
                targetState = 'value';
                break;
            case 'operator':
                subExpression.currentState.hasValue = false;
                subExpression.currentState.hasOperator = false;
                targetState = 'operator';
                break;
            case 'property':
                subExpression.currentState.hasValue = false;
                subExpression.currentState.hasOperator = false;
                if (previousPropertyToken) {
                    targetState = 'property';
                } else if (schema.rootType.name === '$global') {
                    subExpression.currentState.hasProperty = false;
                    subExpression.currentState.hasObject = false;
                    targetState = 'object';
                } else {
                    subExpression.currentState.hasProperty = false;
                    targetState = 'property';
                }
        }
        subExpression.tokens.splice(tokenIndex, subExpression.tokens.length);
        cmp.set('v.subExpression', subExpression);
        var value = token.value;
        var lastPropertyToken = subExpression.tokens.findLast(function (token) { return token.type === 'property'; });
        if (token.type === 'value' && _expressionParser.typeHasStringValue(lastPropertyToken.propertyType) && value.match(/^'.*'$/)) {
            value = value.substring(1, value.length - 1);
        }
        cmp.set('v._value', value);
        var placeholder = helper._getPlaceholder(subExpression, schema);
        var lookup = helper._generateLookup(subExpression, schema, cmp.get('v.strategy'));
        cmp.set('v._placeholder', placeholder);
        cmp.set('v._lookup', lookup);
        var searchValue = value.toLowerCase().trim();
        cmp.set('v._filteredItems', lookup.items.filter(function (item) { return item.searchValue.contains(searchValue); }));
        cmp.set('v._index', lookup.items.length === 0 ? -1 : 0);
        window.setTimeout($A.getCallback(function () {
            cmp.find('input').focus();
        }), 100);
    },

    handleInit: function (cmp, event, helper) {
        helper.init(cmp);
    },

    handleLookupItemClick: function (cmp, event, helper) {
        var index = event.currentTarget.dataset.index;
        var lookup = cmp.get('v._filteredItems');
        var lookupItem = lookup[index].value;
        helper.processLookupItem(cmp, lookupItem, cmp.get('v._lookup.targetState'));
        cmp.find('input').focus();
    },

    handleIsPopupOpenChanged: function (cmp, event, helper) {
        helper.updatePopupLocation(cmp);
    }
})
