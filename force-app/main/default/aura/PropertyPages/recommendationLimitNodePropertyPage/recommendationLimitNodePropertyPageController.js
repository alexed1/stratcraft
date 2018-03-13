({
    handleInit: function (component, event, helper) {
        var currentNode = component.get('v.currentNode');
        component.set('v.filterModes', currentNode && currentNode.filterModes ? currentNode.filterModes.join(',') : '');
    },

    handleCurrentNodeChanged: function (component, event, helper) {
        var currentNode = component.get('v.currentNode');
        component.set('v.filterModes', currentNode && currentNode.filterModes ? currentNode.filterModes.join(',') : '');
    },

    handleFilterModesChanged: function (component, event, helper) {
        var currentNode = component.get('v.currentNode');
        var filterModes = component.get('v.filterModes');
        if (currentNode && filterModes) {
            currentNode.filterModes = filterModes.split(',');
        }
    }
})
