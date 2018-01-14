({
    handleClick: function(cmp, event, helper) {
        var cmpEvent = $A.get("e.c:propertyPageSaveRequestEvent");
        cmpEvent.setParams({
            "changedStrategyNode": cmp.get("v.curNode"),
            "originalNodeName" : cmp.get("v.originalName")
        });
        cmpEvent.fire();
    },
})
