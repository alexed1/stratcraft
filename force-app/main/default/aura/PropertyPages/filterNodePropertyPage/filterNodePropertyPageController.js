({
    openExpressionBuilder: function (cmp, event, helper) {
        _modalDialog.show(
            'Expression Builder',
            [_utils.getComponentName('expressionBuilder'), function (body) {
                body.set('v.expression', cmp.get('v.currentNode.expression'));
                body.load();
            }],
            function (body) {
                var expression = body.resolveExpression();
                cmp.set('v.currentNode.expression', expression);
            },
            function (body) {
                return body.validate();
            });
    },
})
