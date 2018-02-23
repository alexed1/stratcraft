({
    updateSelectableNodes: function (component) {
        var currentNode = component.get('v.currentNode');
        if (!currentNode) {
            return;
        }
        var nodeDataRequestEvent = $A.get('e.c:nodeDataRequestEvent');
        nodeDataRequestEvent.setParams({
            'nodeName': currentNode.name,
            'nodeRelationship': _utils.NodeRequestType.IMMEDIATE_DESCENDANTS,
            'callback': function (nodes) {
                var result = [];
                nodes.forEach(function (item) { result.push(item.name); });
                component.set('v.selectableNodes', result);
            }
        });
        nodeDataRequestEvent.fire();
    }
})