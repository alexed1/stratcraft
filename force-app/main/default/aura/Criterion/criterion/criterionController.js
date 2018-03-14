({
    onInit: function (component, event, helper) {
        helper.loadAvailableFields(component);
    },

    handleObjectChange: function (component, event, helper) {
        var isCriteriaListChanged = Array.isArray(event.getParam('value'));
        if (isCriteriaListChanged) {
            return;
        }
        helper.loadAvailableFields(component);
        component.set('v.value.fieldName', '');
        component.set('v.value.selectedOp', '');
        component.set('v.value.value', '');
        component.find('fieldSelect').focus();
    },

    handleFieldChange: function (component, event, helper) {
        var fieldName = component.get('v.value.fieldName');
        var opSelect = component.find('opSelect');
        if (fieldName === '')
            component.set('v.value.selectedOp', '');
        else {
            component.set('v.value.selectedOp', '==');
            opSelect.focus();
        }
    },

    handleOperatorChange: function (component, event, helper) {
        var valueInput = component.find('valueInput');
        valueInput.focus();
    },

    handleDelete: function (component, event, helper) {
        var cmpEvent = component.getEvent('deleteCriterion');
        cmpEvent.setParams({
            'index': component.get('v.index')
        });
        cmpEvent.fire();
    },

    handleAddSelect: function (component, event, helper) {
        var cmpEvent = component.getEvent('addCriterion');
        cmpEvent.setParams({
            'index': component.get('v.index')
        });
        cmpEvent.fire();
    }
})