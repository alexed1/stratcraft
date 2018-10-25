({
    onInit: function (cmp, event, helper) {
        var expression = cmp.get('v.currentNode.soql');
        if (!expression) {
            cmp.set('v.shortenedSoql', 'Configure');
        } else if (expression.match(/^SELECT.+FROM/)) {
            cmp.set('v.shortenedSoql', expression.split('WHERE').slice(1).join('WHERE').trim() || 'Configure');
        } else {
            cmp.set('v.shortenedSoql', expression);
        }
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
                        body.set('v.mode', 'soql');
                        var whereClause = cmp.get('v.shortenedSoql');
                        body.set('v.expression', whereClause === 'Configure' ? '' : whereClause);
                        body.load();
                    }],
                    function (body) {
                        var expression = body.resolveExpression();
                        cmp.set('v.currentNode.soql', expression);
                        cmp.set('v.shortenedSoql', expression || 'Configure');
                    },
                    function (body) {
                        return body.validate();
                    });
            }
        });
        retrieveContextTypesEvt.fire();
    },

    doInit: function (cmp, event, helper) {
        var contextTypesDataLoadedEvent = $A.get('e.c:contextTypesDataLoadedEvent');
        contextTypesDataLoadedEvent.setParams({
            'callback': function () { cmp.set('v.contextTypesLoaded', true); }
        });
        cmp.set('v.contextTypesLoaded', false);
        contextTypesDataLoadedEvent.fire();
    }
})
