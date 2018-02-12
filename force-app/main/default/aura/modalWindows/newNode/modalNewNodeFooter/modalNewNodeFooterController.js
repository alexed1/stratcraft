({
    handleCancel: function (component, event, helper) {
        component.find('newNodeDialog').notifyClose();
    },

    handleOK: function (component, event, helper) {
        var newNodeComponent = component.newNodeComponent;
        var isValid = newNodeComponent.validate();
        if (isValid) {
            var newNodeEvent = $A.get('e.c:newNodeCreationRequestedEvent');
            newNodeEvent.setParams({
                'name': newNodeComponent.get('v.name').trim(),
                'parentNodeName': newNodeComponent.get('v.selectedParentNodeName')
            });
            newNodeEvent.fire();
            component.find('newNodeDialog').notifyClose();
        }
    }
})
