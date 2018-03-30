({
    handleDeleteRequest: function (component, event, helper) {
        var cmpEvent = component.getEvent('deleteRequested');
        cmpEvent.fire();
    },

    handleDirectionChange: function (component, event, helper) {
    	 var direction = event.getParam('value');
    	 component.set('v.currentItem.direction', direction);
    }
})
