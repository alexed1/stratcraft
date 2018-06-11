({
    validate: function (cmp, event, helper) {
        return helper.validate(cmp);
    },

    handleSaveClick: function (cmp, event, helper) {
        var isValid = helper.validate(cmp);
        if (!isValid) {
            return;
        }
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
        } else {
            helper.loadNodeTypes(cmp);
            cmp.set('v.availableParentNodes', []);
        }
        helper.clearValidation(cmp);
    },

    handleTypeChanged: function (cmp, event, helper) {
        var originalNodeName = cmp.get('v.currentNode.name');
        var strategy = cmp.get('v.currentStrategy');
        var currentNode = cmp.get('v._currentNodeDirty');
        cmp.set('v._isIf', currentNode && currentNode.nodeType === _utils.NodeType.IF);
        cmp.set('v._isSoqlLoad', currentNode && currentNode.nodeType === _utils.NodeType.SOQL_LOAD);
        cmp.set('v._isFilter', currentNode && currentNode.nodeType === _utils.NodeType.FILTER);
        cmp.set('v._isUnion', currentNode && currentNode.nodeType === _utils.NodeType.UNION);
        cmp.set('v._isRecommendationLimit', currentNode && currentNode.nodeType === _utils.NodeType.RECOMMENDATION_LIMIT);
        cmp.set('v._isSort', currentNode && currentNode.nodeType === _utils.NodeType.SORT);
        cmp.set('v._isExternalConnection', currentNode && currentNode.nodeType === _utils.NodeType.EXTERNAL_CONNECTION);
        cmp.set('v._isRecordJoin', currentNode && currentNode.nodeType === _utils.NodeType.RECORD_JOIN);
        cmp.set('v._isMutuallyExclusive', currentNode && currentNode.nodeType === _utils.NodeType.MUTUALLY_EXCLUSIVE);

        if (currentNode
            && currentNode.nodeType === _utils.NodeType.SORT
            && (!currentNode.sortKeys || currentNode.sortKeys.length == 0)) {
            cmp.set('v._currentNodeDirty.sortKeys',
                [{
                    name: 'Name',
                    order: 'Asc'
                }]);
        }

        if (currentNode && currentNode.nodeType === _utils.NodeType.EXTERNAL_CONNECTION) {
            cmp.set("v.allowNodeTypeSelection", false);
            cmp.set("v.showParent", false);
        }

        if (currentNode && currentNode.nodeType === _utils.NodeType.IF && originalNodeName && (!currentNode.branches || currentNode.branches.length === 0)) {
            var branches = _strategy.getDirectChildrenNodes(strategy, originalNodeName)
                .map(function (childNode) {
                    return {
                        child: childNode.name,
                        expression: 'true'
                    }
                });
            cmp.set('v._currentNodeDirty.branches', branches);
        }

        helper.clearValidation(cmp);
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
    },

    handleConnectionModeChange: function (cmp, event, helper) {
        var isConnectionMode = cmp.get('v.isConnectionMode');
        cmp.set('v.showParent', !isConnectionMode);
        helper.loadNodeTypes(cmp);
    }
})
