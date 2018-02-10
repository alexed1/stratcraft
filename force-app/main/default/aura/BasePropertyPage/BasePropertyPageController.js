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

    handleTypeChange: function (cmp, event, helper) {
        var curNode = cmp.get("v.curNode");
        if (curNode)
            cmp.set("v.isIfNode", curNode.type == 4);
    },

    //reset the page
    resetPage: function (cmp, event, helper) {
        cmp.set("v.originalName", cmp.get("v.curNode.name"));
    },

    //Clears everything related to current node and strategy
    clear: function (cmp, event, helper) {
        cmp.set('v.curNode', null);
        cmp.set('v.originalName', null);
        cmp.set('v.curStrat', null);
        cmp.set('v.isIfNode', false);
    }
})
