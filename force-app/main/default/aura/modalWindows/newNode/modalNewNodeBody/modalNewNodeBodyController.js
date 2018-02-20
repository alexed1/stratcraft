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

        var nodeDisplayNameMap = new Map();
        nodeDisplayNameMap.set(_utils.NodeType.IF, 'If');
        nodeDisplayNameMap.set(_utils.NodeType.SOQL_LOAD, 'SOQL Load');
        nodeDisplayNameMap.set(_utils.NodeType.FILTER, 'Filter');
        nodeDisplayNameMap.set(_utils.NodeType.UNION, 'Union');
        nodeDisplayNameMap.set(_utils.NodeType.RECOMMENDATION_LIMIT, 'Recommendation Limit');
        component.set('v.availableNodeTypes', nodeDisplayNameMap);
    },

    validate: function (component, event, helper) {
        var nodeNameCmp = component.find('nodeName');
        var parentNameCmp = component.find('parentNode');
        var newNodeName = component.get('v.name');
        var parentNodes = component.get('v.availableParentNodeNames');
        var nodeType = component.get('v.selectedNodeType');
        var nodeDisplayNameMap = component.get('v._nodeDisplayNameMap');
        nodeType = nodeDisplayNameMap.get(nodeType);

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
