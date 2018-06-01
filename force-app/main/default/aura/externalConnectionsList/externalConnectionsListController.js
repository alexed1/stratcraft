({
    handleCurrentStrategyChanged: function (cmp, event, helper) {
        var strategy = cmp.get('v.currentStrategy');
        var container = cmp.find('container');
        if (strategy && strategy.externalConnections) {
            $A.util.removeClass(container, 'slds-hide');
            cmp.set('v._externalConnections', strategy.externalConnections);
        } else {
            $A.util.addClass(container, 'slds-hide')
            cmp.set('v._externalConnections', []);
        }
    },

    handleItemClick: function (cmp, cmpEvent, helper) {
        var nodeName = cmpEvent.currentTarget.dataset.node;
        var showConnectionPropertiesRequested = cmp.getEvent('showConnectionPropertiesRequested');
        showConnectionPropertiesRequested.setParams({
            'nodeName': nodeName
        });
        showConnectionPropertiesRequested.fire();
    }
})
