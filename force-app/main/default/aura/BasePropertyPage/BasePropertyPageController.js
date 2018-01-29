({
    handleClick: function (cmp, event, helper) {
        var cmpEvent = $A.get("e.c:propertyPageSaveRequestEvent");
        console.log("processing handle click in base");
        cmpEvent.setParams({
            "changedStrategyNode": cmp.get("v.curNode"),
            "originalNodeName": cmp.get("v.originalName")
        });
        cmpEvent.fire();
    },

    //reset the page
    resetPage: function (cmp, event, helper) {
        cmp.set("v.originalName", cmp.get("v.curNode.name"));
    }

})
