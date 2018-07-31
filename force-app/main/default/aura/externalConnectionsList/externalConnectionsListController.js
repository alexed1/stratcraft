({
    handleCurrentStrategyChanged: function (cmp, event, helper) {
        var self = this;
        var strategy = cmp.get('v.currentStrategy');
        var container = cmp.find('connectionsContainer');
        if (strategy && strategy.externalConnections && strategy.externalConnections.length > 0) {
            $A.util.removeClass(container, 'slds-hide');
            cmp.set('v._externalConnections', strategy.externalConnections);
            if (cmp.get("v._contextMenuInited") == false) {
                var pollingId = window.setInterval(
                    $A.getCallback(function () {
                        helper.delayedContextMenuInitialisation(cmp, pollingId);
                    }), 500);
            }
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
