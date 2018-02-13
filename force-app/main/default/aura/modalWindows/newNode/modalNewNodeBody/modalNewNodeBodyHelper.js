({
    validateNewNodeName: function (newNodeName, parentNodeNames) {
        var validity = { valid: true, badInput: false, valueMissing: false };
        if (_utils.isEmptyOrWhitespace(newNodeName)) {
            validity.valid = false;
            validity.valueMissing = true;
        }
        else if (_utils.arrayIncludesStringCI(parentNodeNames, newNodeName)) {
            validity.valid = false;
            validity.badInput = true;
        }
        return validity;
    }
})
