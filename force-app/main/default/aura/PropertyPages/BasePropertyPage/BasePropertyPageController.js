({
    handleSaveClick: function (cmp, event, helper) {
        var componentEvent = cmp.getEvent('propertyPageSaveRequest');
        componentEvent.setParams({
            'newNodeState': cmp.get('v._currentNodeDirty'),
            'originalNodeState': cmp.get('v.currentNode')
        });
        componentEvent.fire();
    },

    handleNodeActions: function (cmp, event) {
        var selectedMenuItemValue = event.getParam('value');
        switch (selectedMenuItemValue) {
            case 'delete':
                var componentEvent = $A.get('e.c:nodeDeletionRequestedEvent');
                componentEvent.setParams({ 'node': cmp.get('v.currentNode') });
                componentEvent.fire();
                break;
        }
    },

    handleStrategyChanged: function (cmp, event, helper) {
        helper.loadNodeTypes(cmp);
        cmp.set('v.availableParentNodes', []);
    },

    handleCurrentNodeChanged: function (cmp, event, helper) {
        var currentNode = event.getParam('value');
        cmp.set('v._currentNodeDirty', currentNode ? _utils.clone(currentNode, true) : null);
        if (currentNode) {
            helper.removeEmptyNodeType(cmp);
            helper.loadParentNodes(cmp);
            helper.reevaluateBranchesFlags(cmp, currentNode);
        } else {
            helper.loadNodeTypes(cmp);
            cmp.set('v.availableParentNodes', []);
        }
    },

    handleTypeChanged: function (cmp, event, helper) {
        var currentNode = cmp.get('v._currentNodeDirty');
        cmp.set('v._isIf', currentNode && currentNode.nodeType === _utils.NodeType.IF);
        cmp.set('v._isSoqlLoad', currentNode && currentNode.nodeType === _utils.NodeType.SOQL_LOAD);
        cmp.set('v._isFilter', currentNode && currentNode.nodeType === _utils.NodeType.FILTER);
        cmp.set('v._isUnion', currentNode && currentNode.nodeType === _utils.NodeType.UNION);
        cmp.set('v._isRecommendationLimit', currentNode && currentNode.nodeType === _utils.NodeType.RECOMMENDATION_LIMIT);
        cmp.set('v._isSort', currentNode && currentNode.nodeType === _utils.NodeType.SORT);
        cmp.set('v._isExternalConnection', currentNode && currentNode.nodeType === _utils.NodeType.EXTERNAL_CONNECTION);
        cmp.set('v._isRecordJoin', currentNode && currentNode.nodeType === _utils.NodeType.RECORD_JOIN);

    },

    handleBranchPriorityChange: function (cmp, event, helper) {
        //here we swap places of 2 branch nodes in strategy.nodes array 
        var option = event.getSource().get("v.name");
        var isUp = false;
        if (option === 'up') {
            isUp = true;
        }
        else if (option != 'down') {
            throw new Error("Can't recognize in what way to change the branch priority");
        }

        //searching for which node to swap with
        var currentStrategy = cmp.get("v.currentStrategy");
        var currentNode = cmp.get("v.currentNode");
        var indexOfNodeGlobal = currentStrategy.nodes.findIndex(x => x.name == currentNode.name);
        var ifNodeBranchesNodes = currentStrategy.nodes.filter(x => x.parentNodeName == currentNode.parentNodeName);
        var indexOfNodeLocal = ifNodeBranchesNodes.findIndex(x => x.name === currentNode.name);
        var indexOfNodeToSwapWithGlobal = -1;
        var nodeToSwapWith = {};
        if (isUp) {
            nodeToSwapWith = ifNodeBranchesNodes[indexOfNodeLocal - 1];
        }
        else
            nodeToSwapWith = ifNodeBranchesNodes[indexOfNodeLocal + 1];

        indexOfNodeToSwapWithGlobal = currentStrategy.nodes.findIndex(x => x.name === nodeToSwapWith.name);

        //swapping
        currentStrategy.nodes[indexOfNodeGlobal] = nodeToSwapWith;
        currentStrategy.nodes[indexOfNodeToSwapWithGlobal] = currentNode;

        cmp.set("v.currentStrategy", currentStrategy);
    },

    //reset the page
    resetPage: function (cmp, event, helper) {
        cmp.set('v.currentNode', cmp.get('v._currentNodeDirty'));
    },

    //Clears everything related to current node and strategy
    clear: function (cmp, event, helper) {
        cmp.set('v.currentNode', null);
        cmp.set('v.currentStrategy', null);
    },

    isDirty: function (cmp, event, helper) {
        var originalState = cmp.get('v.currentNode');
        var actualState = cmp.get('v._currentNodeDirty');
        //It means that no node has been selected yet
        if (!originalState && !actualState) {
            return false;
        }
        //We can afford to make this kind of comparison in order to avoid all the hassle of manging types and properties
        //because strateyg nodes all are created at the same place, thus the order of the fields of same type nodes will be the same
        var result = JSON.stringify(originalState) !== JSON.stringify(actualState);
        return result;
    }
})
