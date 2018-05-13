({
    validate: function (cmp, event, helper) {
        var validateCallback = cmp.get('v.validateCallback');
        if (!validateCallback) {
            return true;
        }
        var textbox = cmp.find('text');
        var errorLabel = cmp.find('textError');
        var isValid = validateCallback(cmp.get('v.input'));
        _cmpUi.toggleError(textbox, errorLabel, isValid);
        return isValid;
    }
})