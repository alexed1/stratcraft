({
    toggleError: function (valueComponent, errorLabel, isValid) {
        if (isValid) {
            $A.util.removeClass(valueComponent, 'slds-has-error');
            $A.util.addClass(errorLabel, 'slds-hide');
        } else {
            $A.util.addClass(valueComponent, 'slds-has-error');
            $A.util.removeClass(errorLabel, 'slds-hide');
        }
    },

    validateName: function (cmp) {
        var textBox = cmp.find('name');
        var errorLabel = cmp.find('nameError');
        var value = (cmp.get('v.strategyName') || '').trim();
        var isValid = _strategy.isNameValid(value);
        this.toggleError(textBox, errorLabel, isValid);
        return isValid;
    },

    validateLabel: function (cmp) {
        var textBox = cmp.find('label');
        var errorLabel = cmp.find('labelError');
        var value = cmp.get('v.strategyMasterLabel') || '';
        var isValid = !value.match(/^\s*$/);
        this.toggleError(textBox, errorLabel, isValid);
        return isValid;
    },

    validateDescription: function (cmp) {
        var textBox = cmp.find('description');
        var errorLabel = cmp.find('descriptionError');
        var value = cmp.get('v.strategyDescription') || '';
        var isValid = !value.match(/^\s*$/);
        this.toggleError(textBox, errorLabel, isValid);
        return isValid;
    }
})
