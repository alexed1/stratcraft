({
    handleTreeSelect: function (cmp, event, helper) {
        var nodeName = event.getParam('name');
        var nodeSelectedEvent = cmp.getEvent('nodeSelected');
        nodeSelectedEvent.setParams({
            'name': nodeName
        });
        nodeSelectedEvent.fire();
    }
})
