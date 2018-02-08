({
    doInit: function (cmp, event, helper) {
        var nodes = cmp.get("v.selectableNodes");
        if (nodes.length > 0 && nodes[0] != '--None--') {
            nodes.splice(0, 0, "--None--");
            cmp.set("v.selectableNodes", nodes);
        }
    },

    handleDelete: function (cmp, event, helper) {
        var cmpEvent = cmp.getEvent("removeFilter");
        cmpEvent.setParams({
            "index": cmp.get("v.index")
        });
        cmpEvent.fire();
    },

    handleSelectedNodeName: function (cmp, event, helper) {
        helper.notifyFilterUpdated(cmp);
    },

    handleExpression: function (cmp, event, helper) {

        var modalBody;
        var modalFooter;
        $A.createComponents([
            ["c:expressionBuilder", {}],
            ["c:expressionsFooter", {}]
        ],
            function (components, status) {
                if (status === "SUCCESS") {
                    modalBody = components[0];
                    modalBody.initExpressionBuilder(cmp.get("v.expression"));
                    modalFooter = components[1];
                    var userChoice = false;
                    var expression = {};
                    modalFooter.addEventHandler("c:expressionsEvent", function (auraEvent) {
                        userChoice = auraEvent.getParam("result");
                        expression = auraEvent.getParam("expression");
                    })

                    cmp.find('expressionsDialog').showCustomModal({
                        header: "Expression builder",
                        body: modalBody,
                        footer: modalFooter,
                        showCloseButton: false,
                        closeCallback: function () {
                            if (userChoice) {
                                cmp.set("v.expression", expression);
                                helper.notifyFilterUpdated(cmp);
                            }
                        }
                    });
                }
            });
    }

})
