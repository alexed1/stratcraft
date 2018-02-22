({
    handleInit: function (component, event, helper) {
        if (typeof _utils !== 'undefined') {
            component.set('v.availableNodeTypes', _utils.NodeType.getValueNamePairs());
        }
    },

    handleClick: function (component, event, helper) {
        var cmpEvent = $A.get('e.c:propertyPageSaveRequestEvent');
        console.log('processing handle click in base');
        cmpEvent.setParams({
            'changedStrategyNode': component.get('v._currentNodeDirty'),
            'originalNodeName': component.get('v.currentNode').name
        });
        cmpEvent.fire();
    },

    handleCurrentNodeChange: function (component, event, helper) {
        var currentNode = component.get('v.currentNode');
        component.set('v._currentNodeDirty', currentNode ? _utils.clone(currentNode, true) : null);
    },

    handleTypeChange: function (component, event, helper) {
        var currentNode = component.get('v._currentNodeDirty');
        component.set('v._isIf', currentNode && currentNode.nodeType === _utils.NodeType.IF);
        component.set('v._isSoqlLoad', currentNode && currentNode.nodeType === _utils.NodeType.SOQL_LOAD);
        component.set('v._isFilter', currentNode && currentNode.nodeType === _utils.NodeType.FILTER);
        component.set('v._isUnion', currentNode && currentNode.nodeType === _utils.NodeType.UNION);
        component.set('v._isRecommendationLimit', currentNode && currentNode.nodeType === _utils.NodeType.RECOMMENDATION_LIMIT);
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
