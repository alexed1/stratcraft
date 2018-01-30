({

    doInit: function (cmp, event, helper) {
        var action = cmp.get("c.getAvailableObjects");
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();

                var emptySelectionObject = { 'name': '', 'label': '--None--' };

                result.map((obj) => {
                    obj.selected = false;
                    obj.fields.map((f) => {
                        f.selected = false;
                        return f;
                    });
                    obj.fields.splice(0, 0, emptySelectionObject)
                    return obj;
                })

                result.splice(0, 0, emptySelectionObject);
                cmp.set("v.objects", result);
            }
        });

        $A.enqueueAction(action);
    },


    handleObjectChange: function (cmp, event, helper) {
        var selectedObject = cmp.get("v.selectedObjectName");
        var objects = cmp.get("v.objects");
        var obj = objects.find(function (o) { return o.name == selectedObject });

        if (selectedObject != "")
            cmp.set("v.fields", obj.fields);
        else {
            cmp.set("v.fields", []);
        }

        cmp.set("v.selectedFieldName", '');
    },

    handleFieldChange: function (cmp, event, helper) {
        var selectedField = cmp.get("v.selectedFieldName");
        console.log(selectedField);
    },

    doneRendering: function (cmp, event, helper) {
        if (!cmp.get("v.isDoneRendering") && cmp.get("v.objects").length > 0) {
            cmp.set("v.isDoneRendering", true);
            // cmp.find("objectSelect").set("v.value", "");
            // cmp.set("v.selectedObject", "");
        }
    }

})
