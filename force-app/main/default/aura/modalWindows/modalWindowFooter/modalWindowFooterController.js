({
    handleCancel: function (component, event, helper) {
        var clickEvent = component.getEvent('buttonClickEvent');
        clickEvent.setParams({ 'Button': _utils.ModalDialogButtonType.CANCEL });
        clickEvent.fire();
    },

    handleOK: function (component, event, helper) {
        var clickEvent = component.getEvent('buttonClickEvent');
        clickEvent.setParams({ 'Button': _utils.ModalDialogButtonType.OK });
        clickEvent.fire();
    }
})
