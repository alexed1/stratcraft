({
    init: function (cmp, event, helper) {
        helper.initializeJsPlumb(cmp);
    },

    handleCurrentStrategyChanged: function (cmp, event, helper) {
        helper.rebuildStrategyDiagram(cmp, cmp.get('v.currentStrategy'));
    },

    canSelectNewStrategy: function (cmp, event, helper) {
        var args = event.getParam('arguments');
        args.commitCallback();
    }
})
