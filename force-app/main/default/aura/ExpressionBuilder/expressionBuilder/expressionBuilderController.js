({
    doInit: function (cmp, event, helper) {
        //actual loading is moved to aura:method, so it can be called externally after all attributes are set
    },

    handleModeChanged: function (cmp, event, helper) {
        var mode = cmp.get('v.mode');
        var availableObjects = helper.getAvailableObjects(mode);
        cmp.set('v.availableObjects', availableObjects);
    },

    switchModes: function (cmp, event, helper) {
        var isBuilderMode = cmp.get('v.isBuilderMode');
        if (isBuilderMode) {
            var expressionString = helper.resolveExpression(cmp);
            cmp.set('v.expression', expressionString);
            cmp.set('v.isBuilderMode', false);
        } else {
            var schema = cmp.get('v._schema');
            var mode = cmp.get('v.mode');
            var stringExpression = cmp.get('v.expression');
            var expression = helper.x_parseExpression(stringExpression, mode, schema);
            if (expression) {
                cmp.set('v.criteria', expression);
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
                if (mode === 'soql') {
                    typeList = typeList.filter(function (item) { return item.name === 'Proposition'; });
                }
                var schema = {
                    typeList: typeList,
                    typeMap: typeList.reduce(function (result, item) {
                        result[item.name] = item;
                        return result;
                    }, {})
                };
                schema.typeList.forEach(function (type) {
                    type.fieldMap = type.fieldList.reduce(function (result, item) {
                        result[item.name] = item;
                        return result;
                    }, {});
                });
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
