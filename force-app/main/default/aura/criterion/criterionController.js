({
    doInit: function (cmp, event, helper) {
        var action = cmp.get("c.getAvailableObjects");
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();

                var criteriaExists = helper.initExistingCriteria(cmp);

                var selectedObjectName = cmp.get("v.selectedObjectName");
                var selectedFieldName = cmp.get("v.selectedFieldName");

                var emptySelectionObject = { name: '', label: '--None--', selected: criteriaExists ? false : true };

                result.map((obj) => {
                    obj.selected = criteriaExists ? obj.name == selectedObjectName : false;
                    obj.fields.map((f) => {
                        f.selected = criteriaExists ? f.name == selectedFieldName : false;
                        return f;
                    });
                    obj.fields.splice(0, 0, emptySelectionObject)
                    return obj;
                });

                result.splice(0, 0, emptySelectionObject);
                cmp.set("v.objects", result);

                if (criteriaExists) {
                    var obj = result.find(function (o) { return o.name == selectedObjectName });
                    cmp.set("v.fields", obj.fields);
                }

                cmp.set("v.isLoading", false);
            }
        });

        $A.enqueueAction(action);
    },


    handleObjectChange: function (cmp, event, helper) {
        if (cmp.get("v.isLoading"))
            return;

        var objects = cmp.get("v.objects");

        //mark fields as not selected in previous object
        var previousObjectName = event.getParam("oldValue");
        if (previousObjectName) {
            var prevObj = objects.find(function (o) { return o.name == previousObjectName });
            if (prevObj) {
                prevObj.fields.forEach(function (i) { i.selected = false });
            }
        }

        var selectedObject = cmp.get("v.selectedObjectName");

        var obj = objects.find(function (o) { return o.name == selectedObject });
        obj.fields.forEach(function (i) { i.selected = false });

        if (selectedObject != "" && obj) {
            cmp.set("v.fields", obj.fields);
            cmp.find("fieldSelect").focus();
        }
        else {
            cmp.set("v.fields", []);
        }
        cmp.set("v.selectedFieldName", '');

        helper.resetCriteria(cmp);
    },

    handleFieldChange: function (cmp, event, helper) {
        if (cmp.get("v.isLoading"))
            return;

        var fieldName = cmp.get("v.selectedFieldName");
        var opSelect = cmp.find("opSelect");
        if (fieldName == '')
            opSelect.set("v.value", '');
        else {
            cmp.set("v.selectedOp", "eq");
            opSelect.focus();
        }

        helper.resetCriteria(cmp);
    },

    handleOpChange: function (cmp, event, helper) {
        if (cmp.get("v.isLoading"))
            return;
        var valueInput = cmp.find("valueInput");
        valueInput.set("v.value", '');
        valueInput.focus();
        helper.resetCriteria(cmp);
    },

    handleValueChange: function (cmp, event, helper) {
        if (cmp.get("v.isLoading"))
            return;
        var selectedObject = cmp.get("v.selectedObjectName");
        var fieldName = cmp.get("v.selectedFieldName");
        var op = cmp.get("v.selectedOp");
        var textVal = cmp.get("v.textValue");
        if (selectedObject && fieldName && op && textVal)
            helper.assembleCriteria(cmp, event, helper, selectedObject, fieldName, op, textVal);

    }
})