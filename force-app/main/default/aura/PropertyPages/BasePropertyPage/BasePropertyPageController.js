({
    handleSaveClick: function (component, event, helper) {
        var componentEvent = $A.get('e.c:propertyPageSaveRequestEvent');
        componentEvent.setParams({
            'newNodeState': component.get('v._currentNodeDirty'),
            'originalNodeState': component.get('v.currentNode')
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

    handleStrategyChanged: function (component, event, helper) {
        helper.loadNodeTypes(component);
        component.set('v.availableParentNodes', []);
    },

    handleCurrentNodeChanged: function (component, event, helper) {
        var currentNode = component.get('v.currentNode');
        component.set('v._currentNodeDirty', currentNode ? _utils.clone(currentNode, true) : null);
        if (currentNode) {
            helper.removeEmptyNodeType(component);
            helper.loadParentNodes(component);
        } else {
            helper.loadNodeTypes(component);
            component.set('v.availableParentNodes', []);
        }
    },

    handleTypeChanged: function (component, event, helper) {
        var currentNode = component.get('v._currentNodeDirty');
        component.set('v._isIf', currentNode && currentNode.nodeType === _utils.NodeType.IF);
        component.set('v._isSoqlLoad', currentNode && currentNode.nodeType === _utils.NodeType.SOQL_LOAD);
        component.set('v._isFilter', currentNode && currentNode.nodeType === _utils.NodeType.FILTER);
        component.set('v._isUnion', currentNode && currentNode.nodeType === _utils.NodeType.UNION);
        component.set('v._isRecommendationLimit', currentNode && currentNode.nodeType === _utils.NodeType.RECOMMENDATION_LIMIT);
        component.set('v._isSort', currentNode && currentNode.nodeType === _utils.NodeType.SORT);
        component.set('v._isExternalConnection', currentNode && currentNode.nodeType === _utils.NodeType.EXTERNAL_CONNECTION);
        component.set('v._isRecordJoin', currentNode && currentNode.nodeType === _utils.NodeType.RECORD_JOIN);

    },

    //reset the page
    resetPage: function (component, event, helper) {
        component.set('v.currentNode', component.get('v._currentNodeDirty'));
    },

    //Clears everything related to current node and strategy
    clear: function (component, event, helper) {
        component.set('v.currentNode', null);
        component.set('v.currentStrategy', null);
    },

    isDirty: function (component, event, helper) {
        var originalState = component.get('v.currentNode');
        var actualState = component.get('v._currentNodeDirty');
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
