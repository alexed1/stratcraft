({

    handleCancel: function (component, event, helper) {
        var cmpEvent = $A.get("e.c:expressionsEvent");
        cmpEvent.setParams({
            "result": false
        });
        cmpEvent.fire();
        component.find("expressionsDialog").notifyClose();
    },

    handleOK: function (component, event, helper) {
        var cmpEvent = $A.get("e.c:expressionsEvent");
        cmpEvent.setParams({
            "result": true
        });
        cmpEvent.fire();
        component.find("expressionsDialog").notifyClose();
    },

    handleExpressionUpdatedEvent: function (component, event, helper) {

    }
})
