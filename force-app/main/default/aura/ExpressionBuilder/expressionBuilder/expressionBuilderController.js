({
    doInit: function (cmp, event, helper) {
        //actual loading is moved to aura:method, so it can be called externally after all attributes are set
    },

    swithModes: function (cmp, event, helper) {
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
        if (cmp.get("v.mode") == 'soql') {
            //probably due to special permissions Proposition object is not present in objects that you can retrieve 
            //via APEX code when run in lightning environment
            //however same controller code is able to retrieve propositions when run from developer console
            //since we don't really need any other object - we just mock an object and it fields  
            var allObjects = [{ name: 'Proposition', label: 'Proposition', fields: [{ name: "Id", label: "Proposition ID" }, { name: "IsDeleted", label: "Deleted" }, { name: "Name", label: "Name" }, { name: "CreatedDate", label: "Created Date" }, { name: "CreatedById", label: "Created By ID" }, { name: "LastModifiedDate", label: "Last Modified Date" }, { name: "LastModifiedById", label: "Last Modified By ID" }, { name: "SystemModstamp", label: "System Modstamp" }, { name: "LastViewedDate", label: "Last Viewed Date" }, { name: "LastReferencedDate", label: "Last Referenced Date" }, { name: "ActionReference", label: "Action Reference" }, { name: "Description", label: "Description" }] }];
            helper.initExpressionBuilder(cmp, allObjects);
        }
        else {
            var action = cmp.get('c.getAvailableObjects');
            action.setCallback(this, function (response) {
                var state = response.getState();

                if (cmp.isValid() && state === 'SUCCESS') {
                    var allObjects = response.getReturnValue();
                    helper.initExpressionBuilder(cmp, allObjects);
                }
            });
            $A.enqueueAction(action);
        }
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
