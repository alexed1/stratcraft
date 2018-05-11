({
    validate: function (cmp, event, helper) {
        var filterSetCmp = cmp.find('filterSet');
        var errorLabelCmp = cmp.find('filterSetError');
        var currentNode = cmp.get('v.currentNode');
        if (currentNode.nodeType !== _utils.NodeType.SORT) {
            _cmpUi.toggleError(filterSetCmp, errorLabelCmp, true);
        }
        var hasSortKeys = currentNode.sortKeys && currentNode.sortKeys.length > 0;
        _cmpUi.toggleError(filterSetCmp, errorLabelCmp, hasSortKeys);
        return hasSortKeys;
    },

    clearValidation: function (cmp, event, helper) {
        var filterSetCmp = cmp.find('filterSet');
        var errorLabelCmp = cmp.find('filterSetError');
        _cmpUi.toggleError(filterSetCmp, errorLabelCmp, true);
    }
})
