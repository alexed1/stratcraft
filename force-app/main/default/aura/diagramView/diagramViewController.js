({
    init: function (component, event, helper) {
        helper.initializeJsPlumb(component);
    },

    handleCurrentStrategyChanged: function (component, event, helper) {
        helper.rebuildStrategyDiagram(component, component.get('v.currentStrategy'));
    }
})
