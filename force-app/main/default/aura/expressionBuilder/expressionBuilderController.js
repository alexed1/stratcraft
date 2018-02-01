({
    doInit: function (cmp, event, helper) {
        cmp.set("v.criterias", ["$Record.Contact.Payment_Due_Date__c &lt; (TODAY() - 30)", ""]);
    }
})
