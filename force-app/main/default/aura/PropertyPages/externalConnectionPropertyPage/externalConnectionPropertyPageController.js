({
    validate: function (cmp, event, helper) {
        var currentNode = cmp.get("v.currentNode");

        var typeCmp = cmp.find("type");
        var typeErrorCmp = cmp.find("typeError");

        var hasTypeSelected = currentNode.type && !currentNode.type.match(/\s+/);

        _cmpUi.toggleError(null, typeErrorCmp, hasTypeSelected);
        return hasTypeSelected;
    },

    clearValidation: function (cmp, event, helper) {
        var typeErrorCmp = cmp.find("typeError");
        _cmpUi.toggleError(null, typeErrorCmp, true);
    }
})
