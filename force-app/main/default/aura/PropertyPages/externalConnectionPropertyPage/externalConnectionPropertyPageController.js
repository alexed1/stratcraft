({
    validate: function (cmp, event, helper) {
        var currentNode = cmp.get("v.currentNode");

        var typeCmp = cmp.find("type");
        var typeErrorCmp = cmp.find("typeError");

        var hasTypeSelected = currentNode.type && !currentNode.type.match(/\s+/);

        _cmpUi.toggleError(null, typeErrorCmp, hasTypeSelected);

        var filterSetCmp = cmp.find('filterSet');
        var argsHasNames = filterSetCmp.validate();
        return hasTypeSelected && argsHasNames;
    },

    clearValidation: function (cmp, event, helper) {
        var filterSetCmp = cmp.find('filterSet');
        filterSetCmp.clearValidation();
        var typeErrorCmp = cmp.find("typeError");
        _cmpUi.toggleError(null, typeErrorCmp, true);
    }
})
