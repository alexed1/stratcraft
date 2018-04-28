({
    handleInit: function (component, event, helper) {
        var nodeDataRequestEvent = $A.get('e.c:nodeDataRequestEvent');
        nodeDataRequestEvent.setParams({
            'nodeRelationship': _utils.NodeRequestType.ALL,
            'callback': function (strategyNodes) {
                var result = [];
                //We don't allow External Connection node to be a potential parent
                strategyNodes.forEach(function (item) {
                    if (item.nodeType !== _utils.NodeType.EXTERNAL_CONNECTION) {
                        result.push(item.name);
                    }
                });
                component.set('v.availableParentNodeNames', result);
            }
        });
        nodeDataRequestEvent.fire();
        component.set('v.availableNodeTypes', _utils.NodeType.getValueNamePairs());
    },

    validate: function (component, event, helper) {
        var nodeNameComponent = component.find('nodeName');
        var parentNameComponent = component.find('parentNode');
        var newNodeName = component.get('v.name');
        var parentNodes = component.get('v.availableParentNodeNames');
        var nodeType = component.get('v.selectedNodeType');
        var nodeDisplayNameMap = component.get('v._nodeDisplayNameMap');

        var validity = helper.validateNewNodeName(newNodeName, parentNodes);
        nodeNameComponent.set('v.validity', validity);
        if (validity.valid) {
            return true;
        }
        parentNameComponent.focus();
        nodeNameComponent.focus();
        return false;
    }
})
