({

    doInit: function (cmp, event, helper) {
        // var opts = [
        //     { value: "Red", label: "Red" },
        //     { value: "Green", label: "Green" },
        //     { value: "Blue", label: "Blue" }
        // ];
        // component.set("v.objects", opts);
        var action = cmp.get("c.getAvailableObjects");
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();
                cmp.set("v.objects", result);
            }
        });

        $A.enqueueAction(action);
    }

})
