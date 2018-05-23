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

    // _getLookup: function (tokens, schema) {
    //     var lastToken = tokens.length == 0 ? null : tokens[tokens.length - 1];
    //     var resultFields = [];
    //     if (lastToken) {
    //         if (lastToken.type === 'value' || lastToken.type === 'operator') {
    //             resultFields = [];
    //         } else {
    //             resultFields = lastToken.parentType && schema.typeNameMap.hasOwnProperty(lastToken.parentType)
    //                 ? schema.typeNameMap[lastToken.parentType].fieldList
    //                 : schema.rootType.fieldList;
    //         }
    //     } else {
    //         resultFields = schema.rootType.fieldList;
    //     }
    //     var result = resultFields.map(function (field) {
    //         return {
    //             header: field.name,
    //             headerDetails: ' - ' + field.label,
    //             subHeader: schema.rootType.name
    //         }
    //     });
    //     return result;
    // },

    init: function (cmp) {
        var subExpression = cmp.get('v.subExpression');
        var schema = cmp.get('v.schema');
        var placeholder = this._getPlaceholder(subExpression.currentState);
        //var lookup = this._getLookup(allTokens, schema);
        cmp.set('v._placeholder', placeholder);
        // cmp.set('v._lookup', lookup);
        // cmp.set('v._filteredLookup', lookup);
    },

    handleValueChanged: function (cmp, value, forceTransition) {
        var subExpression = cmp.get('v.subExpression');
        var schema = cmp.get('v.schema');
        var valueIsProcessed = _expressionParser.processValue(value, subExpression.currentState, schema, subExpression.tokens, forceTransition);
        if (valueIsProcessed) {
            cmp.set('v.subExpression', subExpression);
            //Strange, but after setting the value of subexpression attribute, this object loses 'currentState' property. Need to re-set it
            //cmp.set('v.subExpression.currentState', subExpression.currentState);
            cmp.set('v._value', '');
            cmp.set('v._placeholder', this._getPlaceholder(subExpression.currentState));
        }
    }
})
