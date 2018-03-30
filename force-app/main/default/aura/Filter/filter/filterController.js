({
    handleDeleteRequest: function (component, event, helper) {
        var cmpEvent = component.getEvent('deleteRequested');
        cmpEvent.fire();
    },

    openExpressionBuilder: function (component, event, helper) {
        _modalDialog.show(
            'Expression Builder',
            ['c:expressionBuilder', function (body) {
                body.set('v.expression', component.get('v.currentItem.expression'));
            }],
            function (body) {
                var expression = body.resolveExpression();
                component.set('v.currentItem.expression', expression);
            });
    }
})
