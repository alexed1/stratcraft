({
    validate: function (cmp, event, helper) {
        var validation = [helper.validateName(cmp), helper.validateLabel(cmp), helper.validateDescription(cmp)];
        return validation.reduce(function (validSoFar, valid) { return validSoFar && valid; }, true);
    }
})
