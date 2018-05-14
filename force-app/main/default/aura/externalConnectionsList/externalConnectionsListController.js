({
    handleCurrentStrategyChanged: function (cmp, event, helper) {
        var strategy = cmp.get('v.currentStrategy');
        var container = cmp.find('container');
        if (strategy && strategy.nodes) {
            $A.util.removeClass(container, 'slds-hide');
            cmp.set('v._externalConnections', strategy.nodes.filter(function (item) {
                return item.nodeType === _utils.NodeType.EXTERNAL_CONNECTION;
            }));
        } else {
            $A.util.addClass(container, 'slds-hide')
            cmp.set('v._externalConnections', []);
        }
    },

    handleItemClick: function (cmp, cmpEvent, helper) {
        var nodeName = cmpEvent.currentTarget.dataset.node;
        var showNodePropertiesRequested = cmp.getEvent('showNodePropertiesRequested');
        showNodePropertiesRequested.setParams({
            'nodeName': nodeName
        });
        showNodePropertiesRequested.fire();
    }
})
