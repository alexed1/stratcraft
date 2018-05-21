({
    handleValueChange: function (cmp, event, helper) {
        var value = cmp.get('v._value') || '';
        if (value.trim()) {
            helper.handleValueChanged(cmp, value);
        }
    },

    handleInputKeyUp: function (cmp, event, helper) {
        if (event.keyCode == 13) {
            var value = cmp.get('v._value');
            var normalizedValue = value.trim().toUpperCase();
            var commitStatus = helper.getValueCommitStatus(cmp, value, normalizedValue);
            if (commitStatus) {
                helper.commitValue(cmp, value, normalizedValue);
            }
        }
    },

    handleTokenClick: function (cmp, event, helper) {

    },

    handleInit: function (cmp, event, helper) {
        helper.initOperatorsLookup(cmp);
        helper.init(cmp);
    },
})
