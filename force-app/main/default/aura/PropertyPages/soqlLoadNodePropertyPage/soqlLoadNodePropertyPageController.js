({
    onInit: function (cmp, event, helper) {
        var expr = cmp.get("v.currentNode.soql");
        if (expr) {
            cmp.set("v.shortenedSoql", expr.split('WHERE')[1].trim());
        }
    },

    openExpressionBuilder: function (cmp, event, helper) {
        _modalDialog.show(
            'Expression Builder',
            [_utils.getComponentName('expressionBuilder'), function (body) {
                body.set('v.mode', 'soql');
                body.set('v.expression', cmp.get('v.currentNode.soql'));
                body.load();
            }],
            function (body) {
                var expression = body.resolveExpression();
                cmp.set('v.currentNode.soql', expression);
                if (expression) {
                    cmp.set("v.shortenedSoql", expression.split('WHERE')[1].trim());
                }
                else
                    cmp.set("v.shortenedSoql", 'Configure');
            });
    }
})
