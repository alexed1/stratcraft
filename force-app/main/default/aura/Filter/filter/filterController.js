({
    handleDeleteRequest: function (component, event, helper) {
        var cmpEvent = component.getEvent('deleteRequested');
        cmpEvent.fire();
    },

    openExpressionBuilder: function (component, event, helper) {
        var modalBody;
        $A.createComponents([
            ['c:expressionBuilder', {}]
        ],
            function (components, status) {
                if (status === 'SUCCESS') {
                    modalBody = components[0];
                    modalBody.initExpressionBuilder(component.get('v.currentBranch.expression'));
                    var userWantsToSave = false;
                    var expression = {};
                    modalBody.addEventHandler('c:expressionBuilderDialogClosedEvent', function (auraEvent) {
                        userWantsToSave = auraEvent.getParam('result');
                        expression = auraEvent.getParam('expression');
                    })

                    component.find('expressionBuilderDialog').showCustomModal({
                        header: 'Expression builder',
                        body: modalBody,
                        showCloseButton: false,
                        closeCallback: function () {
                            if (userWantsToSave) {
                                component.set('v.currentBranch.expression', expression);
                            }
                        }
                    });
                }
            });
    }

})
