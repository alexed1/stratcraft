({
    handleDeleteRequest: function (component, event, helper) {
        var cmpEvent = component.getEvent('deleteRequested');
        cmpEvent.fire();
    },

    handleDirectionChange: function (component, event, helper) {
    	  
    },

    init: function(component, event, helper) {
    	//if nullsFirst isn't initialized to a value, the server will reject it
    	var currentNullsSetting = component.get('v.currentItem.nullsFirst');
    	if (currentNullsSetting == '') {
    		component.set('v.currentItem.nullsFirst', false);
    	}
    }
})
