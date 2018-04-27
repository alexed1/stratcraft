({
    handleDeleteRequest: function (cmp, event, helper) {
        var cmpEvent = cmp.getEvent('deleteRequested');
        cmpEvent.fire();
    },

    openExpressionBuilder: function (cmp, event, helper) {
        _modalDialog.show(
            'Expression Builder',
            ['c:expressionBuilder', function (body) {
                body.set('v.expression', cmp.get('v.currentItem.expression'));
            }],
            function (body) {
                var expression = body.resolveExpression();
                cmp.set('v.currentItem.expression', expression);
            });
    },

    handleBranchPriorityChange: function (cmp, event, helper) {
        var option = event.getSource().get("v.name");
        var cmpEvent = cmp.getEvent('priorityChangeRequested');
        cmpEvent.setParams({ 'destination': option });
        cmpEvent.fire();
    }
})
