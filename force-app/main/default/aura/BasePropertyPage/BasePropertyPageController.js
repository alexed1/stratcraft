({
    handleClick: function (cmp, event, helper) {
        var cmpEvent = $A.get("e.c:propertyPageSaveRequestEvent");
        console.log("processing handle click in base");
        cmpEvent.setParams({
            "changedStrategyNode": cmp.get("v._currentNodeDirty"),
            "originalNodeName": cmp.get("v.currentNode").name
        });
        cmpEvent.fire();
    },

    handleCurrentNodeChange: function (component, event, helper) {
        var currentNode = component.get('v.currentNode');
        component.set('v._currentNodeDirty', currentNode ? _utils.clone(currentNode, true) : null);
    },

    handleTypeChange: function (cmp, event, helper) {
        var curNode = cmp.get("v._currentNodeDirty");
        if (curNode)
            cmp.set("v.isIfNode", curNode.type == 4);
    },

    //reset the page
    resetPage: function (cmp, event, helper) {
        cmp.set("v.currentNode", cmp.get("v._currentNodeDirty"));
    },

    //Clears everything related to current node and strategy
    clear: function (cmp, event, helper) {
        cmp.set('v.currentNode', null);
        cmp.set('v.curStrat', null);
        cmp.set('v.isIfNode', false);
    },

    hasChanges: function (component, event, helper) {
        var originalState = component.get('v.currentNode');
        var actualState = component.get('v._currentNodeDirty');
        //It means that no node has been selected yet
        if (!originalState && !actualState) {
            return false;
        }
        var noChanges = _utils.areUndefinedOrEqual(originalState.name, actualState.name)
            && _utils.areUndefinedOrEqual(originalState.description, actualState.description)
            && _utils.areUndefinedOrEqual(originalState.parentNodeName, actualState.parentNodeName)
            && _utils.areUndefinedOrEqual(originalState.type, actualState.type)
            && _utils.areUndefinedOrEqual(originalState.definition, actualState.definition);
        return !noChanges;
    }
})
