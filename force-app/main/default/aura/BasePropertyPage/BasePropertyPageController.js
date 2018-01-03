({
    handleBlur: function(component, event, helper) {
        var nodeItem = component.get("v.nodeItem");
        // add event firing here - to update lightning:tree if name or parentNodeName were changed
        console.log(nodeItem);
    },
})
