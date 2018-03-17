({
    loadAvailableFields: function (component) {
        var availableObjects = component.get('v.availableObjects');
        var objectName = component.get('v.value.objectName');
        var object = availableObjects.filter(function (item) { return item.name === objectName; })[0];
        component.set('v.availableFields', object.fields);
    }
})