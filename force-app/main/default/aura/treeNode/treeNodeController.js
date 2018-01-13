({
    handleTreeSelect : function(component, event, helper) {
        var cmpEvent = $A.get("e.c:saveEvent");
        cmpEvent.setParams({
            "name": event.getParam('name')
        });
        cmpEvent.fire();
    },
})
