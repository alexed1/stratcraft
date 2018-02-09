({

    doInit: function (cmp, event, helper) {
        //trying to fix a bug
        //cmp.find("nodeSelect").set("v.value", '');

    },

    handleDeleteRequest: function (cmp, event, helper) {
        var cmpEvent = cmp.getEvent("deleteFilter");
        cmpEvent.setParams({
            "index": cmp.get("v.index")
        });
        cmpEvent.fire();
    },

    handleSelectedNodeNameChange: function (cmp, event, helper) {
        var params = event.getParams();
        if ((params.oldValue != params.value) && params.value && params.value.length != 0)
            helper.notifyFilterUpdated(cmp);
    },

    openExpressionBuilder: function (cmp, event, helper) {
        var modalBody;
        $A.createComponents([
            ["c:expressionBuilder", {}]
        ],
            function (components, status) {
                if (status === "SUCCESS") {
                    modalBody = components[0];
                    modalBody.initExpressionBuilder(cmp.get("v.expression"));
                    var userWantsToSave = false;
                    var expression = {};
                    modalBody.addEventHandler("c:expressionBuilderDialogClosedEvent", function (auraEvent) {
                        userWantsToSave = auraEvent.getParam("result");
                        expression = auraEvent.getParam("expression");
                    })

                    cmp.find('expressionBuilderDialog').showCustomModal({
                        header: "Expression builder",
                        body: modalBody,
                        showCloseButton: false,
                        closeCallback: function () {
                            if (userWantsToSave) {
                                cmp.set("v.expression", expression);
                                helper.notifyFilterUpdated(cmp);
                            }
                        }
                    });
                }
            });
    },

    log: function (cmp, event, helper) {
        console.log('v.expression ' + cmp.get("v.expression"));
    }

})
