({
    //##############controller methods

    loadStrategyNames: function (cmp, event, helper) {
        var callback = event.getParam('callback');
        var sessionId = cmp.get("v.sessionId");
        var action = cmp.get("c.loadStrategyNamesRequest");
        action.setParams({ sessionId: sessionId });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();
                callback(result);
            }
        });
        $A.enqueueAction(action);
    },

    getStrategy: function (cmp, event, helper) {
        var sessionId = cmp.get("v.sessionId");
        var callback = event.getParam('callback');
        cmp.set("v.callback", callback);
        var strategyName = event.getParam("strategyName");
        var action = cmp.get("c.getStrategyRequest");
        action.setParams({ sessionId: sessionId, strategyName: strategyName });
        action.setCallback(this, function (response, callback) {
            if (cmp.isValid() && response.getState() === "SUCCESS") {
                var id = response.getReturnValue();
                cmp.set("v.id", id);
                var pollingId = window.setInterval(
                    $A.getCallback(function (callback) {
                        helper.callRetrievalStatus(cmp, helper);
                    }), 2000);
                cmp.set("v.pollingId", pollingId);
            }
        });
        $A.enqueueAction(action);
    },

    createOrUpdateStrategy: function (cmp, event, helper) {
        var sessionId = cmp.get("v.sessionId");
        var callback = event.getParam('callback');
        cmp.set("v.callback", callback);
        var strategyXML = event.getParam("strategyXML");
        var action = cmp.get("c.createOrUpdateStrategyRequest");
        action.setParams({ sessionId: sessionId, strategyXML: strategyXML });
        action.setCallback(this, function (response, callback) {
            if (cmp.isValid() && response.getState() === "SUCCESS") {
                var id = response.getReturnValue();
                cmp.set("v.id", id);
                var pollingId = window.setInterval(
                    $A.getCallback(function (callback) {
                        helper.callDeployStatus(cmp, helper);
                    }), 2000);
                cmp.set("v.pollingId", pollingId);
            }
        });
        $A.enqueueAction(action);
    },

    deleteStrategy: function (cmp, event, helper) {
        var sessionId = cmp.get("v.sessionId");
        var callback = event.getParam('callback');
        cmp.set("v.callback", callback);
        var strategyName = event.getParam("strategyName");
        var action = cmp.get("c.deleteStrategyRequest");
        action.setParams({ sessionId: sessionId, strategyName: strategyName });
        action.setCallback(this, function (response, callback) {
            if (cmp.isValid() && response.getState() === "SUCCESS") {
                var id = response.getReturnValue();
                cmp.set("v.id", id);
                var pollingId = window.setInterval(
                    $A.getCallback(function (callback) {
                        helper.callDeployStatus(cmp, helper);
                    }), 2000);
                cmp.set("v.pollingId", pollingId);
            }
        });
        $A.enqueueAction(action);
    },

    renameStrategy: function (cmp, event, helper) {
        var sessionId = cmp.get("v.sessionId");
        var callback = event.getParam('callback');
        cmp.set("v.callback", callback);
        var strategyXML = event.getParam("strategyXML");
        var newStrategyName = event.getParam("newStrategyName");
        var action = cmp.get("c.renameStrategyRequest");
        action.setParams({ sessionId: sessionId, newStrategyName: newStrategyName, strategyXML: strategyXML });
        action.setCallback(this, function (response, callback) {
            if (cmp.isValid() && response.getState() === "SUCCESS") {
                var id = response.getReturnValue();
                cmp.set("v.id", id);
                var pollingId = window.setInterval(
                    $A.getCallback(function (callback) {
                        helper.callDeployStatus(cmp, helper);
                    }), 2000);
                cmp.set("v.pollingId", pollingId);
            }
        });
        $A.enqueueAction(action);
    },

    copyStrategy: function (cmp, event, helper) {
        var sessionId = cmp.get("v.sessionId");
        var callback = event.getParam('callback');
        cmp.set("v.callback", callback);
        var strategyXML = event.getParam("strategyXML");
        var newStrategyName = event.getParam("newStrategyName");
        var action = cmp.get("c.copyStrategyRequest");
        action.setParams({ sessionId: sessionId, newStrategyName: newStrategyName, strategyXML: strategyXML });
        action.setCallback(this, function (response, callback) {
            if (cmp.isValid() && response.getState() === "SUCCESS") {
                var id = response.getReturnValue();
                cmp.set("v.id", id);
                var pollingId = window.setInterval(
                    $A.getCallback(function (callback) {
                        helper.callDeployStatus(cmp, helper);
                    }), 2000);
                cmp.set("v.pollingId", pollingId);
            }
        });
        $A.enqueueAction(action);
    },

    //################################
    
    callRetrievalStatus: function (cmp, helper) {
        var action = cmp.get("c.checkRetrievalStatusRequest");
        var id = cmp.get("v.id");
        var sessionId = cmp.get("v.sessionId");
        var pollingId = cmp.get("v.pollingId");
        var callback = cmp.get("v.callback");
        action.setParams({ sessionId: sessionId, id: id });
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                var retVal = response.getReturnValue();
                if (retVal != "deploying") {
                    cmp.set("v.message", retVal);
                    callback(retVal);
                    window.clearInterval(pollingId);
                }
            }

        });
        $A.enqueueAction(action);
    },

    callDeployStatus: function (cmp, helper) {
        var action = cmp.get("c.checkDeployStatusRequest");
        var id = cmp.get("v.id");
        var sessionId = cmp.get("v.sessionId");
        var pollingId = cmp.get("v.pollingId");
        var callback = cmp.get("v.callback");
        action.setParams({ sessionId: sessionId, id: id });
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                var retVal = response.getReturnValue();
                if (retVal != "deploying") {
                    cmp.set("v.message", retVal);
                    callback(retVal);
                    window.clearInterval(pollingId);
                }
            }

        });
        $A.enqueueAction(action);
    }
})