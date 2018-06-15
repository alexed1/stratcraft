({
    openExpressionBuilder: function (cmp, event, helper) {
        var index = event.getSource().get('v.value');
        _modalDialog.show(
            'Expression Builder',
            [_utils.getComponentName('expressionBuilder'), function (body) {
                body.set('v.strategy', cmp.get('v.strategy'));
                body.set('v.mode', 'if');
                body.set('v.expression', cmp.get('v.currentNode.branches[' + index + '].expression'));
                body.load();
            }],
            function (body) {
                var expression = body.resolveExpression() || 'true';
                cmp.set('v.currentNode.branches[' + index + '].expression', expression);
            },
            function (body) {
                return body.validate();
            });
    },

    moveBranch: function (cmp, event, helper) {
        var sourceButton = event.getSource();
        var name = sourceButton.get('v.name');
        var index = sourceButton.get('v.value');
        var branches = cmp.get('v.currentNode.branches');
        var currentBranch = branches.splice(index, 1)[0];
        if (name === 'up') {
            branches.splice(index - 1, 0, currentBranch);
        } else {
            branches.splice(index + 1, 0, currentBranch);
        }
        cmp.set('v.currentNode.branches', branches);
    }
})
