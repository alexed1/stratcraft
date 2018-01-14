({
    handleTreeSelect : function(component, event, helper) {
        var cmpEvent = $A.get("e.c:treeNodeSelectedEvent");
        cmpEvent.setParams({
            "name": event.getParam('name')
        });
        cmpEvent.fire();
    },
})
