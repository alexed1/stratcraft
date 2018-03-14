({
    doInit: function (component, event, helper) {
        var action = component.get('c.getAvailableObjects');
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (component.isValid() && state === 'SUCCESS') {
                var allObjects = response.getReturnValue();
                var expression = component.get('v.expression');
                var criteria = [];
                if (expression) {
                    criteria = helper.rebuildCriteriaFromExpression(expression);
                    //If expression can't be parse then criteria will be null
                    if (!criteria) {
                        component.set('v.isBuilderMode', false);
                        component.set('v.isLoading', false);
                        return;
                    }
                    //This is to make sure, that if criteria object or its field don't exist in current org, then we add them to the list
                    criteria.forEach(function (criteriaItem) {
                        var existingObject = allObjects.filter(function (item) {
                            return item.name === criteriaItem.objectName;
                        });
                        if (existingObject.length === 0) {
                            var label = criteriaItem.objectName.endsWith('__c')
                                ? criteriaItem.objectName.slice(0, criteriaItem.length - 3)
                                : criteriaItem.objectName;
                            existingObject = [{
                                name: criteriaItem.objectName,
                                label: criteriaItem.objectName,
                                fields: []
                            }];
                            allObjects.push(existingObject);
                        }
                        var existingField = existingObject[0].fields.filter(function (item) {
                            return item.name === criteriaItem.fieldName;
                        });
                        if (existingField.length === 0) {
                            var label = criteriaItem.fieldName.endsWith('__c')
                                ? criteriaItem.fieldName.slice(0, criteriaItem.fieldName.length - 3)
                                : criteriaItem.fieldName;
                            existingObject[0].fields.push({
                                name: criteriaItem.fieldName,
                                label: label
                            });
                        }
                    });
                }
                if (criteria.length == 0) {
                    criteria.push({
                        objectName: '',
                        fieldName: '',
                        selectedOp: '',
                        value: ''
                    });
                }
                //Post processing: for each object sort fields by name ascending, add empty field
                //sort all objects by name ascending and add empty object
                var emptySelectionObject = { name: '', label: '--None--' };
                allObjects.forEach(function (item) {
                    item.fields.sort(function (x, y) {
                        return x.label.localeCompare(y.label);
                    });
                    item.fields.splice(0, 0, emptySelectionObject);
                });
                allObjects.sort(function (x, y) {
                    return x.label.localeCompare(y.label);
                });
                allObjects.splice(0, 0, emptySelectionObject);
                component.set('v.availableObjects', allObjects);
                component.set('v.criteria', criteria);
                component.set('v.isLoading', false);
            }
        });
        $A.enqueueAction(action);
    },

    resolveExpression: function (component, event, helper) {
        self = this;
        var isBuilderMode = component.get('v.isBuilderMode');
        if (isBuilderMode) {
            var criteria = component.get('v.criteria');
            if (!criteria || criteria.length === 0) {
                return 'true';
            }
            var expression = criteria.map(function (item) {
                if (item.objectName === '' || item.fieldName === '' || item.selectedOp === '' || item.value === '') {
                    return null;
                }
                var operator = helper.unifyOperators(item.selectedOp);
                return '$Record.' + item.objectName + '.' + item.fieldName + ' ' + operator + ' ' + item.value;
            }).filter(function (item) { return item; })
                .join(' && ');
            return expression;
        } else {
            return component.get('v.expression');
        }
    },

    handleCriterionDelete: function (component, event, helper) {
        var criteria = component.get('v.criteria');
        var index = event.getParam('index');
        criteria.splice(index, 1);
        component.set('v.criteria', criteria);
        helper.updateExpression(component, event, helper);
    },

    //inserts empty criterion object at specified index
    handleCriterionAdd: function (component, event, helper) {
        var criteria = component.get('v.criteria');
        var index = event.getParam('index');
        criteria.splice(index + 1, 0, {});
        component.set('v.criteria', criteria);
    }
})
