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
            var allNodes = currentStrategy.nodes.filter(function (item) {
                return item.name !== currentNode.name && item.nodeType !== _utils.NodeType.EXTERNAL_CONNECTION;
            });
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
    },

    reevaluateBranchesFlags: function (cmp, currentNode) {
        cmp.set("v._isBranchOfIfNode", false);
        cmp.set("v._isFirstBranch", false);
        cmp.set("v._isLastBranch", false);

        var curStrategy = cmp.get('v.currentStrategy');

        var parentNode = curStrategy.nodes.find(x => x.name === currentNode.parentNodeName);
        if (parentNode) {
            if (parentNode.nodeType === _utils.NodeType.IF) {
                cmp.set("v._isBranchOfIfNode", true);

                var ifNodeBranchesNodes = curStrategy.nodes.filter(x => x.parentNodeName == parentNode.name);
                var indexOfNode = ifNodeBranchesNodes.findIndex(x => x.name === currentNode.name);
                if (indexOfNode == 0)
                    cmp.set("v._isFirstBranch", true);
                if (indexOfNode + 1 == ifNodeBranchesNodes.length)
                    cmp.set("v._isLastBranch", true);
            }
        }
    }
})
