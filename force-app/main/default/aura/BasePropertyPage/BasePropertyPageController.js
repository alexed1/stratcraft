({
    handleClick: function(cmp, event, helper) {
        var cmpEvent = $A.get("e.c:strategyUpdatedEvent");
        cmpEvent.setParams({
            "updatedTreeNode": cmp.get("v.nodeItem"),
            "originalNodeName" : cmp.get("v.originalNodeItemType").name
        });
        cmpEvent.fire();
    },
})
