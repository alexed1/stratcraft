({
    handleDeleteRequest: function (component, event, helper) {
        var cmpEvent = component.getEvent('deleteRequested');
        cmpEvent.fire();
    },

    init: function (component, event, helper) {
        //if nullsFirst isn't initialized to a value, the server will reject it
        var currentNullsSetting = component.get('v.currentItem.nullsFirst');
        if (currentNullsSetting == '') {
            component.set('v.currentItem.nullsFirst', false);
        }
    },

    validate: function (cmp, event, helper) {
        var sortNameCmp = cmp.find('sortName');
        var sortNameLabelCmp = cmp.find('sortNameError');
        var sortname = (cmp.get('v.currentItem.name') || '').trim();
        var isSortNameValid = sortname && !sortname.match(/\s+/);
        _cmpUi.toggleError(sortNameCmp, sortNameLabelCmp, isSortNameValid);

        var sortOrderCmp = cmp.find('sortOrder');
        var sortOrderLabelCmp = cmp.find('sortOrderError');
        var sortOrder = (cmp.get('v.currentItem.order') || '').trim();
        var isSortOrderValid = sortOrder;
        _cmpUi.toggleError(sortOrderCmp, sortOrderLabelCmp, isSortOrderValid);
        return isSortNameValid && isSortOrderValid;
    },

    clearValidation: function (cmp, event, helper) {
        var sortNameCmp = cmp.find('sortName');
        var sortNameLabelCmp = cmp.find('sortNameError');
        _cmpUi.toggleError(sortNameCmp, sortNameLabelCmp, true);

        var sortOrderCmp = cmp.find('sortOrder');
        var sortOrderLabelCmp = cmp.find('sortOrderError');
        _cmpUi.toggleError(sortOrderCmp, sortOrderLabelCmp, true);
    }
})
