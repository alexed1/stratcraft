({

    onInit: function (cmp, event, helper) {
        var isMutuallyExclusive = cmp.get("v.isMutuallyExclusive");
        if (isMutuallyExclusive)
            cmp.set("v.nodeSelectLabel", "Continue only with Propositions from:");
    },

    handleDeleteRequest: function (cmp, event, helper) {
        var cmpEvent = cmp.getEvent('deleteRequested');
        cmpEvent.fire();
    },

    openExpressionBuilder: function (cmp, event, helper) {
        _modalDialog.show(
            'Expression Builder',
            [_utils.getComponentName('expressionBuilder'), function (body) {
                body.set('v.mode', 'if');
                body.set('v.expression', cmp.get('v.currentItem.expression'));
                body.load();
            }],
            function (body) {
                var expression = body.resolveExpression();
                cmp.set('v.currentItem.expression', expression);
            },
            function (body) {
                return body.validate();
            });
    },

    handleBranchPriorityChange: function (cmp, event, helper) {
        var option = event.getSource().get("v.name");
        var cmpEvent = cmp.getEvent('priorityChangeRequested');
        cmpEvent.setParams({ 'destination': option });
        cmpEvent.fire();
    }
})
