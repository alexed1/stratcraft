({

    validateName: function (cmp) {
        var textBox = cmp.find('name');
        var errorLabel = cmp.find('nameError');
        var value = (cmp.get('v.strategyName') || '').trim();
        var isValid = _strategy.isNameValid(value);
        _cmpUi.toggleError(textBox, errorLabel, isValid);
        return isValid;
    },

    validateLabel: function (cmp) {
        var textBox = cmp.find('label');
        var errorLabel = cmp.find('labelError');
        var value = cmp.get('v.strategyMasterLabel') || '';
        var isValid = !value.match(/^\s*$/);
        _cmpUi.toggleError(textBox, errorLabel, isValid);
        return isValid;
    },

    validateDescription: function (cmp) {
        var textBox = cmp.find('description');
        var errorLabel = cmp.find('descriptionError');
        var value = cmp.get('v.strategyDescription') || '';
        var isValid = !value.match(/^\s*$/);
        _cmpUi.toggleError(textBox, errorLabel, isValid);
        return isValid;
    }
})
