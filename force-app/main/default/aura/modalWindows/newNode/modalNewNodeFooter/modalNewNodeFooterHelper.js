({

    handleCancel: function (component, event, helper) {
        component.find('newNodeDialog').notifyClose();
    },

    handleOK: function (component, event, helper) {
        var newNodeComponent = component.get('v.newNodeComponent');
        var isValid = newNodeComponent.validate();
        if (isValid) {
            var newNodeEvent = $A.get('e.c:newNodeCreationRequestedEvent');
            newNodeEvent.setParams({
                'name': newNodeComponent.get('v.name'),
                'parentNodeName': newNodEvent.get('v.parentNodeName')
            });
            newNodeEvent.fire();
            newNodEvent.setAttributes()
            component.find('newNodeDialog').notifyClose();
        }
    }
})
