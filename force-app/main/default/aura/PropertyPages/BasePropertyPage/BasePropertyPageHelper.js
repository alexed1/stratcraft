({
    clearNodeTypes: function (component) {
        component.set('v.availableNodeTypes', []);
    },

    loadNodeTypes: function (component) {
        var nodeValueNamePairs = _utils.NodeType.getValueNamePairs();
        nodeValueNamePairs.unshift(['', '']);
        component.set('v.availableNodeTypes', nodeValueNamePairs);
    },

    removeEmptyNodeType: function (component) {
        var availableNodeTypes = component.get('v.availableNodeTypes');
        if (availableNodeTypes[0][0] == '') {
            availableNodeTypes.shift();
            component.set('v.availableNodeTypes', availableNodeTypes);
        }
    }
})
