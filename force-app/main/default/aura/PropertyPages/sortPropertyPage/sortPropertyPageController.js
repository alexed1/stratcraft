({
    validate: function (cmp, event, helper) {
        var filterSetCmp = cmp.find('filterSet');
        var errorLabelCmp = cmp.find('filterSetError');
        var currentNode = cmp.get('v.currentNode');
        if (currentNode.nodeType !== _utils.NodeType.SORT) {
            _cmpUi.toggleError(filterSetCmp, errorLabelCmp, true);
            return true;
        }
        var hasSortKeys = currentNode.sortKeys && currentNode.sortKeys.length > 0;
        _cmpUi.toggleError(null, errorLabelCmp, hasSortKeys);
        var sortKeysAreValid = filterSetCmp.validate();
        return hasSortKeys && sortKeysAreValid;
    },

    clearValidation: function (cmp, event, helper) {
        var filterSetCmp = cmp.find('filterSet');
        filterSetCmp.clearValidation();
        var errorLabelCmp = cmp.find('filterSetError');
        _cmpUi.toggleError(null, errorLabelCmp, true);
    }
})
