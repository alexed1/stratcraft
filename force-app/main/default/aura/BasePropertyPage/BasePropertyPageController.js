({
    handleClick: function(cmp, event, helper) {
        var cmpEvent = $A.get("e.c:propertyPageSaveRequestEvent");
        cmpEvent.setParams({
            "updatedTreeNode": cmp.get("v.selectedTreeNode"),
            "originalNodeName" : cmp.get("v.originalTreeNode").name
        });
        cmpEvent.fire();
    },
})
