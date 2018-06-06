({
    handleSubExpressionAdd: function (cmp, event, helper) {
        var subExpressionIndex = event.getSource().get('v.value');
        var subExpressions = cmp.get('v.subExpressions');
        subExpressions.splice(subExpressionIndex + 1, 0, _expressionParser.createNewSubExpression(cmp.get('v._schema')));
        cmp.set('v.subExpressions', subExpressions);
        helper.focusSubExpression(cmp, subExpressionIndex + 1);
    },

    handleSubExpressionDelete: function (cmp, event, helper) {
        var subExpressionIndex = event.getSource().get('v.value');
        var subExpressions = cmp.get('v.subExpressions');
        subExpressions.splice(subExpressionIndex, 1);
        if (subExpressions.length === 0) {
            subExpressions.push(_expressionParser.createNewSubExpression(cmp.get('v._schema')));
            helper.focusSubExpression(cmp, 0);
        }
        cmp.set('v.subExpressions', subExpressions);
    },

    toggleBuilderMode: function (cmp, event, helper) {
        var isBuilderMode = cmp.get('v.isBuilderMode');
        if (isBuilderMode) {
            var expressionString = helper.resolveExpression(cmp);
            cmp.set('v.expression', expressionString);
            cmp.set('v.isBuilderMode', false);
        } else {
            var schema = cmp.get('v._schema');
            var mode = cmp.get('v.mode');
            var stringExpression = cmp.get('v.expression');
            var expression = helper.parseExpression(stringExpression, mode, schema);
            if (expression) {
                cmp.set('v.subExpressions', expression);
                cmp.set('v.isBuilderMode', true);
            } else {
                var overlay = cmp.find('popover');
                overlay.showCustomPopover({
                    body: 'The expression can\'t be parsed. Please fix the errors and try again',
                    referenceSelector: '.popover-host',
                    cssClass: "slds-popover,slds-p-around_x-small"
                }).then(function (overlay) {
                    setTimeout(function () {
                        overlay.close();
                    }, 1500);
                });
            }
        }
    },

    loadSchema: function (cmp, event, helper) {
        var action = cmp.get('c.getSchema');
        action.setCallback(this, function (response) {
            var state = response.getState();

            if (cmp.isValid() && state === 'SUCCESS') {
                var typeList = response.getReturnValue();
                var mode = cmp.get('v.mode');
                var schema = helper.buildSchema(typeList, mode);
                cmp.set('v._schema', schema);
                helper.initializeBuilder(cmp);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },

    resolveExpression: function (cmp, event, helper) {
        return helper.resolveExpression(cmp);
    },

    handleValidate: function (cmp, event, helper) {
        return helper.validate(cmp);
    }
})
