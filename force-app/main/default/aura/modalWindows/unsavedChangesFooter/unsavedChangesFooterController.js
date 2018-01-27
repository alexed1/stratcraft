({

    handleCancel: function (component, event, helper) {
        var cmpEvent = $A.get("e.c:unsavedChangesEvent");
        cmpEvent.setParams({
            "result": false
        });
        cmpEvent.fire();
        component.find("unsavedChangesDialog").notifyClose();
    },

    handleOK: function (component, event, helper) {
        var cmpEvent = $A.get("e.c:unsavedChangesEvent");
        cmpEvent.setParams({
            "result": true
        });
        cmpEvent.fire();
        component.find("unsavedChangesDialog").notifyClose();
    }
})
