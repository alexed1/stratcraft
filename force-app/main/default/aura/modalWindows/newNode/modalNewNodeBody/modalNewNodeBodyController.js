({
    handleInit: function (component, event, helper) {
        var nodeDataRequestEvent = $A.get('e.c:nodeDataRequestEvent');
        nodeDataRequestEvent.setParams({
            'nodeRelationship': _utils.NodeRequestType.ALL,
            'callback': function (strategyNodes) {
                var result = [];
                strategyNodes.forEach(function (item) { result.push(item.name); });
                component.set('v.availableParentNodeNames', result);
            }
        });
        nodeDataRequestEvent.fire();
    },

    validate: function (component, event, helper) {
        var nodeNameCmp = component.find('nodeName');
        var parentNameCmp = component.find('parentNode');
        var newNodeName = component.get('v.name');
        var parentNodes = component.get('v.availableParentNodeNames');

        var validity = helper.validateNewNodeName(newNodeName, parentNodes);
        nodeNameCmp.set("v.validity", validity);
        if (validity.valid) {
            return true;
        }
        parentNameCmp.focus();
        nodeNameCmp.focus();
        return false;
    }
})
