({

    open: function (component, event, helper) {
        var params = event.getParams().arguments;
        component.set("v.text", params.text);
        component.set("v.headerText", params.headerText);
        component.set("v.callback", params.callback);
        component.set("v.isOpen", true);
    },

    setFalse: function (component, event, helper) {
        var callback = component.get("v.callback");
        if (!$A.util.isUndefinedOrNull(callback)) {
            callback(false);
        }
        component.set("v.isOpen", false);
    },

    setTrue: function (component, event, helper) {
        var callback = component.get("v.callback");
        if (!$A.util.isUndefinedOrNull(callback)) {
            callback(true);
        }
        component.set("v.isOpen", false);
    }
})