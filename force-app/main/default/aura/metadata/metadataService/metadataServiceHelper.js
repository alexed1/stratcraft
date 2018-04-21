({

    // General approach here is to store callback, and then schedulle recurring call to one of controller methods: checkRetrieveStatus or checkDeployStatus
    // No matter if a call was successfull or not - we call callback passing either result or error
    // Also its important to deschedule recurring calls 
    // Controller methods are designed to either return valid value or to throw exception

    loadStrategyNames: function (cmp, event, helper) {
        var self = this;
        self.ensureSessionIdIsLoaded(cmp, function () {
            var callback = event.getParam('callback');
            var sessionId = cmp.get("v.sessionId");
            var action = cmp.get("c.loadStrategyNamesRequest");
            action.setParams({ sessionId: sessionId });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (cmp.isValid() && state === "SUCCESS") {
                    var result = response.getReturnValue();
                    callback({ value: result });
                }
                else {
                    callback({ error: response.getError()[0].message });
                }
            });
            $A.enqueueAction(action);
        });
    },

    getStrategy: function (cmp, event, helper) {
        var self = this;
        self.ensureSessionIdIsLoaded(cmp, function () {
            var sessionId = cmp.get("v.sessionId");
            var callback = event.getParam('callback');
            cmp.set("v.callback", callback);
            var strategyName = event.getParam("strategyName");
            var action = cmp.get("c.getStrategyRequest");
            action.setParams({ sessionId: sessionId, strategyName: strategyName });
            action.setCallback(this, function (response) {
                if (cmp.isValid() && response.getState() === "SUCCESS") {
                    var id = response.getReturnValue();
                    cmp.set("v.id", id);
                    var pollingId = window.setInterval(
                        $A.getCallback(function (callback) {
                            helper.callRetrievalStatus(cmp, helper);
                        }), 2000);
                    cmp.set("v.pollingId", pollingId);
                }
                else {
                    callback({ error: response.getError()[0].message });
                }
            });
            $A.enqueueAction(action);
        });
    },

    createOrUpdateStrategy: function (cmp, event, helper) {
        var self = this;
        self.ensureSessionIdIsLoaded(cmp, function () {
            var sessionId = cmp.get("v.sessionId");
            var callback = event.getParam('callback');
            cmp.set("v.callback", callback);

            var action = {};

            //was it pure XML or a JSON object?
            var strategy = event.getParam("strategy");
            if (strategy) {
                strategy = helper.sortNodes(strategy); //should we also sort nodes for XML?
                action = cmp.get("c.createOrUpdateStrategyRequest");
                action.setParams({ sessionId: sessionId, strategyJSON: JSON.stringify(strategy) });
            }
            else {
                var strategyXML = event.getParam("strategyXML");
                action = cmp.get("c.createOrUpdateStrategyFromXMLRequest");
                action.setParams({ sessionId: sessionId, strategyXML: strategyXML });
            }

            action.setCallback(this, function (response) {
                if (cmp.isValid() && response.getState() === "SUCCESS") {
                    var id = response.getReturnValue();
                    cmp.set("v.id", id);
                    var pollingId = window.setInterval(
                        $A.getCallback(function (callback) {
                            helper.callDeployStatus(cmp, helper, true);
                        }), 2000);
                    cmp.set("v.pollingId", pollingId);
                }
                else {
                    callback({ error: response.getError()[0].message });
                }
            });
            $A.enqueueAction(action);
        });
    },

    deleteStrategy: function (cmp, event, helper) {
        var self = this;
        self.ensureSessionIdIsLoaded(cmp, function () {
            var sessionId = cmp.get("v.sessionId");
            var callback = event.getParam('callback');
            cmp.set("v.callback", callback);
            var strategyName = event.getParam("strategyName");
            var action = cmp.get("c.deleteStrategyRequest");
            action.setParams({ sessionId: sessionId, strategyName: strategyName });
            action.setCallback(this, function (response) {
                if (cmp.isValid() && response.getState() === "SUCCESS") {
                    var id = response.getReturnValue();
                    cmp.set("v.id", id);
                    var pollingId = window.setInterval(
                        $A.getCallback(function (callback) {
                            helper.callDeployStatus(cmp, helper, false);
                        }), 2000);
                    cmp.set("v.pollingId", pollingId);
                }
                else {
                    callback({ error: response.getError()[0].message });
                }
            });
            $A.enqueueAction(action);
        });
    },

    renameStrategy: function (cmp, event, helper) {
        var self = this;
        self.ensureSessionIdIsLoaded(cmp, function () {
            var sessionId = cmp.get("v.sessionId");
            var callback = event.getParam('callback');
            cmp.set("v.callback", callback);
            var strategy = event.getParam("strategy");
            var newStrategyName = event.getParam("newStrategyName");
            var action = cmp.get("c.renameStrategyRequest");
            action.setParams({ sessionId: sessionId, newStrategyName: newStrategyName, strategyJSON: JSON.stringify(strategy) });
            action.setCallback(this, function (response) {
                if (cmp.isValid() && response.getState() === "SUCCESS") {
                    var id = response.getReturnValue();
                    cmp.set("v.id", id);
                    var pollingId = window.setInterval(
                        $A.getCallback(function (callback) {
                            helper.callDeployStatus(cmp, helper, true);
                        }), 2000);
                    cmp.set("v.pollingId", pollingId);
                }
                else {
                    callback({ error: response.getError()[0].message });
                }
            });
            $A.enqueueAction(action);
        });
    },

    copyStrategy: function (cmp, event, helper) {
        var self = this;
        self.ensureSessionIdIsLoaded(cmp, function () {
            var sessionId = cmp.get("v.sessionId");
            var callback = event.getParam('callback');
            cmp.set("v.callback", callback);
            var strategy = event.getParam("strategy");
            var newStrategyName = event.getParam("newStrategyName");
            var action = cmp.get("c.copyStrategyRequest");
            action.setParams({ sessionId: sessionId, newStrategyName: newStrategyName, strategyJSON: JSON.stringify(strategy) });
            action.setCallback(this, function (response) {
                if (cmp.isValid() && response.getState() === "SUCCESS") {
                    var id = response.getReturnValue();
                    cmp.set("v.id", id);
                    var pollingId = window.setInterval(
                        $A.getCallback(function (callback) {
                            helper.callDeployStatus(cmp, helper, true);
                        }), 2000);
                    cmp.set("v.pollingId", pollingId);
                }
                else {
                    callback({ error: response.getError()[0].message });
                }
            });
            $A.enqueueAction(action);
        });
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
                if (retVal) {
                    cmp.set("v.message", retVal);
                    window.clearInterval(pollingId);
                    callback({ value: retVal });
                }
                else {
                    //if the return value is null then it is still deploying
                }
            }
            else {
                //race conditions leads to this error, we can ignore it
                if (!response.getError()[0].message.includes('Retrieve result has been deleted')) {
                    window.clearInterval(pollingId);
                    _cmpUi.spinnerOff(cmp, "spinner");
                    callback({ error: response.getError()[0].message });
                }
            }
        });
        $A.enqueueAction(action);
    },

    callDeployStatus: function (cmp, helper, retrieveAffectedStrategy) {
        var action = cmp.get("c.checkDeployStatusRequest");
        var id = cmp.get("v.id");
        var sessionId = cmp.get("v.sessionId");
        var pollingId = cmp.get("v.pollingId");
        var callback = cmp.get("v.callback");
        action.setParams({ sessionId: sessionId, id: id, retrieveAffectedStrategy: retrieveAffectedStrategy });
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                var retVal = response.getReturnValue();
                if (retVal || !retrieveAffectedStrategy) {
                    cmp.set("v.message", retVal);
                    window.clearInterval(pollingId);
                    callback({ value: retVal });
                }
                else {
                    //if the return value is null then it is still retrieving
                }
            }
            else {
                window.clearInterval(pollingId);
                _cmpUi.spinnerOff(cmp, "spinner");
                callback({ error: response.getError()[0].message });
            }

        });
        $A.enqueueAction(action);
    },

    ensureSessionIdIsLoaded: function (cmp, onRetrieved) {
        console.log("ensureSessionIdIsLoaded running at " + (new Date()).toLocaleTimeString());
        self = this;
        var sessionId = cmp.get("v.sessionId");
        if (sessionId) {
            onRetrieved();
        }
        else
            window.setTimeout(
                $A.getCallback(function () {
                    self.ensureSessionIdIsLoaded(cmp, onRetrieved);
                }), 250
            );
    },

    sortNodes: function (curStrat) {
        //the nodes have to be resorted to meet the requirements of the salesforce mdapi processor
        //TODO: inefficient to do this every time createOrUpdate is called
        var unsortedNodes = curStrat.nodes;
        var sortAlgo = function (x, y) {
            return ((x.nodeType == y.nodeType) ? 0 : ((x.nodeType > y.nodeType) ? 1 : -1));
        }
        var sortedNodes = unsortedNodes.sort(sortAlgo);
        curStrat.nodes = sortedNodes;
        return curStrat;
    }
})