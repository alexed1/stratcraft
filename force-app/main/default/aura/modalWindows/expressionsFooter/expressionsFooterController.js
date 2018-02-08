({

    handleCancel: function (cmp, event, helper) {
        var cmpEvent = $A.get("e.c:expressionsEvent");
        cmpEvent.setParams({
            "result": false
        });
        cmpEvent.fire();
        cmp.find("expressionsDialog").notifyClose();
    },

    handleOK: function (cmp, event, helper) {
        var cmpEvent = $A.get("e.c:expressionsEvent");
        cmpEvent.setParams({
            "result": true,
            "expression": cmp.get("v.expression"),
        });
        cmpEvent.fire();
        cmp.find("expressionsDialog").notifyClose();
    },

    handleExpressionUpdatedEvent: function (cmp, event, helper) {
        var expression = event.getParam("expression");
        cmp.set("v.expression", expression);
    }
})
