({
    clearNodeTypes: function (component) {
        component.set('v.availableNodeTypes', []);
    },

    loadNodeTypes: function (component) {
        var nodeValueNamePairs = _utils.NodeType.getValueNamePairs();
        nodeValueNamePairs.unshift(['', '']);
        component.set('v.availableNodeTypes', nodeValueNamePairs);
    },

    loadParentNodes: function (component) {
        var currentStrategy = component.get('v.currentStrategy');
        var currentNode = component.get('v.currentNode');
        if (!currentStrategy || !currentNode) {
            component.set('v.availableParentNodes', []);
        } else {
            var allNodes = currentStrategy.nodes.filter(function (item) { return item.name !== currentNode.name; });
            allNodes = allNodes.sort(function (x, y) { return x.name.localeCompare(y.name); })
                .map(function (item) { return [item.name, item.name] });
            allNodes.unshift(['', '']);
            component.set('v.availableParentNodes', allNodes);
        }
    },

    removeEmptyNodeType: function (component) {
        var availableNodeTypes = component.get('v.availableNodeTypes');
        if (availableNodeTypes[0][0] == '') {
            availableNodeTypes.shift();
            component.set('v.availableNodeTypes', availableNodeTypes);
        }
    }
})
