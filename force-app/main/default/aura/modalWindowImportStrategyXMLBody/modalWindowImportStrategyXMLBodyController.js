({
    validate: function (cmp, event, helper) {
        var validateCallback = cmp.get('v.validateCallback');
        if (!validateCallback) {
            return true;
        }
        var textbox = cmp.find('text');
        var errorLabel = cmp.find('textError');
        var isValid = validateCallback(cmp.get('v.input'));
        if (isValid) {
            $A.util.removeClass(textbox, 'slds-has-error');
            $A.util.addClass(errorLabel, 'slds-hide');
        } else {
            $A.util.addClass(textbox, 'slds-has-error');
            $A.util.removeClass(errorLabel, 'slds-hide');
        }
        return isValid;
    }
})