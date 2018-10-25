({
    openExpressionBuilder: function (cmp, event, helper) {
        var index = event.getSource().get('v.value');
        var retrieveContextTypesEvt = $A.get('e.c:contextTypesDataRequestEvent');
        retrieveContextTypesEvt.setParams({
            'callback': function (typesList) {
                _modalDialog.show(
                    'Expression Builder',
                    [_utils.getComponentName('expressionBuilder'), function (body) {
                        body.set('v.contextTypesList', typesList);
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
