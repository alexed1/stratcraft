({
    onInit: function (cmp, event, helper) {
        var expression = cmp.get('v.currentNode.soql');
        if (expression) {
            cmp.set('v.shortenedSoql', expression.split('WHERE').slice(1).join('WHERE').trim() || 'Configure');
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
                    var shortenedSoql = expression.split('WHERE').slice(1).join('WHERE').trim();
                    cmp.set('v.shortenedSoql', shortenedSoql || 'Configure');
                }
                else
                    cmp.set('v.shortenedSoql', 'Configure');
            },
            function (body) {
                return body.validate();
            });
    }
})
