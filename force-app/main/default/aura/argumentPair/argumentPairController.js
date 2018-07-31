({
    handleDeleteRequest: function (component, event, helper) {
        var cmpEvent = component.getEvent('deleteRequested');
        cmpEvent.fire();
    },

    validate: function (cmp, event, helper) {
        var argNameCmp = cmp.find('argName');
        var argNameError = cmp.find('argNameError');
        var argName = (cmp.get('v.currentItem.name') || '').trim();
        var isArgNameValid = argName && !argName.match(/\s+/);
        _cmpUi.toggleError(argNameCmp, argNameError, isArgNameValid);

        return isArgNameValid;
    },

    clearValidation: function (cmp, event, helper) {
        var argNameCmp = cmp.find('argName');
        var argNameLabelCmp = cmp.find('argNameError');
        _cmpUi.toggleError(argNameCmp, argNameLabelCmp, true);
    }
})
