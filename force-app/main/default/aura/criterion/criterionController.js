({
    doInit: function (cmp, event, helper) {
        var action = cmp.get("c.getAvailableObjects");

        //should be some kind of a singleton instead of a cached request
        action.setStorable();

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();

                var criterionExists = helper.initExistingCriterion(cmp);

                var selectedObjectName = cmp.get("v.selectedObjectName");
                var selectedFieldName = cmp.get("v.selectedFieldName");

                var emptySelectionObject = { name: '', label: '--None--', selected: criterionExists ? false : true };

                result.map((obj) => {
                    obj.selected = criterionExists ? obj.name == selectedObjectName : false;
                    obj.fields.map((f) => {
                        f.selected = criterionExists ? f.name == selectedFieldName : false;
                        return f;
                    });
                    obj.fields.splice(0, 0, emptySelectionObject)
                    return obj;
                });

                result.splice(0, 0, emptySelectionObject);
                cmp.set("v.availableObjects", result);

                if (criterionExists) {
                    var obj = result.find(function (o) { return o.name == selectedObjectName });
                    cmp.set("v.availableFields", obj.fields);
                    helper.notifyCriterionValueUpdate(cmp);
                }

                cmp.set("v.isLoading", false);
            }
        });

        $A.enqueueAction(action);
    },


    handleObjectChange: function (cmp, event, helper) {
        if (cmp.get("v.isLoading"))
            return;

        var availableObjects = cmp.get("v.availableObjects");

        //mark fields as not selected in previous object
        var previousObjectName = event.getParam("oldValue");
        if (previousObjectName) {
            var prevObj = availableObjects.find(function (o) { return o.name == previousObjectName });
            if (prevObj) {
                prevObj.fields.forEach(function (i) { i.selected = false });
            }
        }

        var selectedObject = cmp.get("v.selectedObjectName");

        //do the same for selected object
        var obj = availableObjects.find(function (o) { return o.name == selectedObject });
        obj.fields.forEach(function (i) { i.selected = false });

        if (selectedObject != "" && obj) {
            cmp.set("v.availableFields", obj.fields);
            cmp.find("fieldSelect").focus();
        }
        else {
            cmp.set("v.availableFields", []);
        }
        cmp.set("v.selectedFieldName", '');

        helper.resetCriterion(cmp);
    },

    handleFieldChange: function (cmp, event, helper) {
        if (cmp.get("v.isLoading"))
            return;

        var fieldName = cmp.get("v.selectedFieldName");
        var opSelect = cmp.find("opSelect");
        if (fieldName == '')
            opSelect.set("v.rightSideValue", '');
        else {
            cmp.set("v.selectedOp", "eq");
            opSelect.focus();
        }

        helper.resetCriterion(cmp);
    },

    handleOpChange: function (cmp, event, helper) {
        if (cmp.get("v.isLoading"))
            return;
        var valueInput = cmp.find("valueInput");
        valueInput.set("v.rightSideValue", '');
        valueInput.focus();
        helper.resetCriterion(cmp);
    },

    handleRightSideValueChange: function (cmp, event, helper) {
        if (cmp.get("v.isLoading"))
            return;
        var selectedObject = cmp.get("v.selectedObjectName");
        var fieldName = cmp.get("v.selectedFieldName");
        var op = cmp.get("v.selectedOp");
        var rightSideValue = cmp.get("v.rightSideValue");
        if (selectedObject && fieldName && op && rightSideValue)
            helper.assembleCriterion(cmp, event, helper, selectedObject, fieldName, op, rightSideValue);

        helper.notifyCriterionValueUpdate(cmp);
    },


    handleDelete: function (cmp, event, helper) {
        var cmpEvent = cmp.getEvent("removeCriterion");
        cmpEvent.setParams({
            "index": cmp.get("v.index")
        });
        cmpEvent.fire();
    },

    handleAddSelect: function (cmp, event, helper) {
        var cmpEvent = cmp.getEvent("addCriterion");
        cmpEvent.setParams({
            "index": cmp.get("v.index")
        });
        cmpEvent.fire();
    }
})