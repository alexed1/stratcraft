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
            var transition = helper.getTransition(cmp, value);
            if (transition.canTransit) {
                helper.performTransition(cmp, transition);
            }
            event.preventDefault();
        }
    },

    handleTokenClick: function (cmp, event, helper) {

    },

    handleInit: function (cmp, event, helper) {
        helper.initOperatorsLookup(cmp);
        helper.init(cmp);
    },
})
