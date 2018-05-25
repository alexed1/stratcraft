({
    handleValueChanged: function (cmp, event, helper) {
        var value = cmp.get('v._value') || '';
        if (value.trim()) {
            helper.handleValueChanged(cmp, value, false);
        }
    },

    handleInputKeyUp: function (cmp, event, helper) {
        if (event.keyCode == 13) {
            var value = cmp.get('v._value');
            helper.handleValueChanged(cmp, value, true);
            event.preventDefault();
        }
    },

    handleInputFocus: function (cmp) {
        cmp.set('v._isPopupOpen', true);
    },

    handleInputBlur: function (cmp) {
        //cmp.set('v._isPopupOpen', false);
    },

    handleTokenClick: function (cmp, event, helper) {

    },

    handleInit: function (cmp, event, helper) {
        //helper.initOperatorsLookup(cmp);
        helper.init(cmp);
    },

    handleLookupItemClick: function (cmp, event) {
        var index = event.currentTarget.dataset.index;
        var lookup = cmp.get('v._filteredLookup');
        helper.handleValueChanged(cmp, lookup[index].value, true);
    }
})
