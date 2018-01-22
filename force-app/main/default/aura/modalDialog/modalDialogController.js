({
	setFalse : function(component, event, helper) {
		var res = component.get("v.result");
		res = false;
        component.set("v.Result", res);
        component.set("v.isOpen", false);
    },
    
    setTrue : function(component, event, helper) {
		var res = component.get("v.result");
		res = true;
        component.set("v.result", res);
        component.set("v.isOpen", false);
    }
})