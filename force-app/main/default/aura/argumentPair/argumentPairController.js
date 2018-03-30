({
     handleDeleteRequest: function (component, event, helper) {
        var cmpEvent = component.getEvent('deleteRequested');
        cmpEvent.fire();
    }
})
