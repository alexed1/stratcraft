({
    notifyFilterUpdated: function (cmp) {
        var cmpEvent = $A.get("e.c:filterUpdatedEvent");
        cmpEvent.fire();
    }
})
