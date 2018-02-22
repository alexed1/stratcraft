({
    notifyFilterUpdated: function (cmp) {
        var cmpEvent = $A.get("e.c:filterValueUpdatedEvent");
        cmpEvent.fire();
    }
})
