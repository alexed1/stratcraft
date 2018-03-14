({
    doInit: function (cmp, event, helper) {
        var expression = event.getParam('arguments').expression;
        helper.assembleCriteriaFromExpression(cmp, expression);
    },

    handleCriterionDelete: function (cmp, event, helper) {
        var criteria = cmp.get("v.criteria");
        var index = event.getParam("index");
        criteria.splice(index, 1);
        cmp.set("v.criteria", criteria);
        helper.updateExpression(cmp, event, helper);
    },

    //inserts empty criterion object at specified index
    handleCriterionAdd: function (cmp, event, helper) {
        var criteria = cmp.get("v.criteria");
        var index = event.getParam("index");
        criteria.splice(index + 1, 0, {});
        cmp.set("v.criteria", criteria);
    },

    handleCriterionUpdatedEvent: function (cmp, event, helper) {
        helper.updateExpression(cmp, event, helper);
    },

    handleCancelClick: function (cmp, event, helper) {
        var cmpEvent = $A.get("e.c:expressionBuilderDialogClosedEvent");
        cmpEvent.setParams({
            "result": false
        });
        cmpEvent.fire();
        cmp.find("expressionBuilderDialog").notifyClose();
    },

    handleOKClick: function (cmp, event, helper) {
        var cmpEvent = $A.get("e.c:expressionBuilderDialogClosedEvent");
        cmpEvent.setParams({
            "result": true,
            "expression": cmp.get("v.expression"),
        });
        cmpEvent.fire();
        cmp.find("expressionBuilderDialog").notifyClose();
    }
})
