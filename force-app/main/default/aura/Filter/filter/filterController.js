({

    onInit: function (cmp, event, helper) {
        var isMutuallyExclusive = cmp.get("v.isMutuallyExclusive");
        if (isMutuallyExclusive)
            cmp.set("v.nodeSelectLabel", "Continue only with Propositions from:");
        var contextTypesDataLoadedEvent = $A.get('e.c:contextTypesDataLoadedEvent');
        contextTypesDataLoadedEvent.setParams({
            'callback': function () { cmp.set('v.contextTypesLoaded', true); }
        });
        cmp.set('v.contextTypesLoaded', false);
        contextTypesDataLoadedEvent.fire();
    },

    handleDeleteRequest: function (cmp, event, helper) {
        var cmpEvent = cmp.getEvent('deleteRequested');
        cmpEvent.fire();
    },

    openExpressionBuilder: function (cmp, event, helper) {
        var index = event.getSource().get('v.value');
        var retrieveContextTypesEvt = $A.get('e.c:contextTypesDataRequestEvent');
        retrieveContextTypesEvt.setParams({
            'callback': function (typesList) {
                _modalDialog.show(
                    'Expression Builder',
                    [_utils.getComponentName('expressionBuilder'), function (body) {
                        body.set('v.contextTypesList', typesList);
                        body.set('v.mode', 'if');
                        body.set('v.expression', cmp.get('v.currentItem.expression'));
                        body.load();
                    }],
                    function (body) {
                        var expression = body.resolveExpression() || 'true';
                        cmp.set('v.currentItem.expression', expression);
                    },
                    function (body) {
                        return body.validate();
                    });
            }
        });
        retrieveContextTypesEvt.fire();
    },

    handleBranchPriorityChange: function (cmp, event, helper) {
        var option = event.getSource().get("v.name");
        var cmpEvent = cmp.getEvent('priorityChangeRequested');
        cmpEvent.setParams({ 'destination': option });
        cmpEvent.fire();
    },

})
