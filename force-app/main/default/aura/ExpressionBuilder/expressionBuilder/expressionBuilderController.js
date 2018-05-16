({
    doInit: function (cmp, event, helper) {
        //actual loading is moved to aura:method, so it can be called externally after all attributes are set
    },

    switchModes: function (cmp, event, helper) {
        var isBuilderMode = cmp.get('v.isBuilderMode');
        if (isBuilderMode) {
            var expression = helper.resolveExpression(cmp);
            cmp.set('v.expression', expression);
            cmp.set('v.isBuilderMode', false);
        } else {
            var criteria = helper.initExpressionBuilder(cmp, cmp.get('v.availableObjects'));
            if (criteria) {
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

    load: function (cmp, event, helper) {
        var action = cmp.get('c.getAvailableObjects');
        action.setCallback(this, function (response) {
            var state = response.getState();

            if (cmp.isValid() && state === 'SUCCESS') {
                var allObjects = response.getReturnValue();
                if (cmp.get('v.mode') === 'soql') {
                    allObjects = allObjects.filter(function (item) { return item.name.toLowerCase() === 'proposition'; });
                }
                helper.initExpressionBuilder(cmp, allObjects);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },

    resolveExpression: function (cmp, event, helper) {
        return helper.resolveExpression(cmp);
    },

    handleCriterionDelete: function (cmp, event, helper) {
        var criteria = cmp.get('v.criteria');
        var index = event.getParam('index');
        criteria.splice(index, 1);
        cmp.set('v.criteria', criteria);
    },

    //inserts empty criterion object at specified index
    handleCriterionAdd: function (cmp, event, helper) {
        var criteria = cmp.get('v.criteria');
        var index = event.getParam('index');
        var newCriteria = {
            objectName: '',
            fieldName: '',
            selectedOp: '',
            value: ''
        };

        if (cmp.get("v.mode") == 'soql')
            newCriteria.objectName = 'Proposition';

        criteria.splice(index + 1, 0, newCriteria);
        cmp.set('v.criteria', criteria);
    }
})
