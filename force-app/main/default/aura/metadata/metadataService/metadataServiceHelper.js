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

    convertJsonToXml: function (cmp, strategy, callback) {
        var action = cmp.get('c.strategyJSONtoXML');
        action.setParams({ strategyJSON: JSON.stringify(this.beforeSave(strategy)) });
        action.setCallback(this, function (response) {
            var isSuccess = true;
            var result = '';
            if (response.getState() === 'SUCCESS') {
                result = response.getReturnValue();
            } else {
                isSuccess = false;
                result = response.getError()[0].message
            }
            callback(isSuccess, result);
        });
        $A.enqueueAction(action);
    },

    getStrategy: function (cmp, event, helper) {
        var self = this;
        self.ensureSessionIdIsLoaded(cmp, function () {
            var sessionId = cmp.get("v.sessionId");
            var callback = event.getParam('callback');
            var strategyName = event.getParam("strategyName");
            var action = cmp.get("c.getStrategyRequest");
            action.setParams({ sessionId: sessionId, strategyName: strategyName });
            action.setCallback(this, function (response) {
                if (cmp.isValid() && response.getState() === "SUCCESS") {
                    var id = response.getReturnValue();
                    var pollingId = window.setInterval(
                        $A.getCallback(function () {
                            helper.callRetrievalStatus(cmp, helper, sessionId, id, callback, pollingId);
                        }), 2000);
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
            var isAsync = event.getParam('isAsync');

            var strategy = helper.beforeSave(event.getParam("strategy"));
            if (isAsync)
                cmp.set("v.savingStatus", "saving changes...");

            var strategyXML = event.getParam("strategyXML");

            if (isAsync) {
                var isSaveRunning = cmp.get("v.isSaveRunning");
                if (isSaveRunning) {
                    helper.setStrategyInQueueForSaving(cmp, strategy.name, strategy);
                    //this strategy saving will be called when previous saving has ended in callDeployStatus method 
                }
                else {
                    cmp.set("v.isSaveRunning", true);
                    helper.sendCreateOrUpdateRequest(cmp, helper, strategy, strategyXML, sessionId, callback, isAsync);
                }
            }
            else
                helper.sendCreateOrUpdateRequest(cmp, helper, strategy, strategyXML, sessionId, callback, isAsync);
        });
    },


    sendCreateOrUpdateRequest: function (cmp, helper, strategy, strategyXML, sessionId, callback, isAsync) {
        var action = {};

        //was it a JSON object or a XML string?
        if (strategy) {
            strategy = helper.beforeSave(helper.sortNodes(strategy));
            action = cmp.get("c.createOrUpdateStrategyRequest");
            action.setParams({ sessionId: sessionId, strategyJSON: JSON.stringify(strategy) });
        }
        else {
            action = cmp.get("c.createOrUpdateStrategyFromXMLRequest");
            action.setParams({ sessionId: sessionId, strategyXML: strategyXML });
        }

        action.setCallback(this, function (response) {
            if (cmp.isValid() && response.getState() === "SUCCESS") {
                var id = response.getReturnValue();
                var pollingId = window.setInterval(
                    $A.getCallback(function () {
                        var strategyName = strategy ? strategy.name : null;
                        helper.callDeployStatus(cmp, helper, true, isAsync, sessionId, id, callback, pollingId, strategyName);
                    }), 2000);
            }
            else {
                callback({ error: response.getError()[0].message });
            }
        });

        $A.enqueueAction(action);

        if (isAsync)
            callback({});
    },

    deleteStrategy: function (cmp, event, helper) {
        var self = this;
        self.ensureSessionIdIsLoaded(cmp, function () {
            var sessionId = cmp.get("v.sessionId");
            var callback = event.getParam('callback');
            var strategyName = event.getParam("strategyName");
            var action = cmp.get("c.deleteStrategyRequest");
            action.setParams({ sessionId: sessionId, strategyName: strategyName });
            action.setCallback(this, function (response) {
                if (cmp.isValid() && response.getState() === "SUCCESS") {
                    var id = response.getReturnValue();
                    var pollingId = window.setInterval(
                        $A.getCallback(function () {
                            helper.callDeployStatus(cmp, helper, false, false, sessionId, id, callback, pollingId);
                        }), 2000);
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
            var strategy = helper.beforeSave(event.getParam("strategy"));
            var newStrategyName = event.getParam("newStrategyName");
            var action = cmp.get("c.renameStrategyRequest");
            action.setParams({ sessionId: sessionId, newStrategyName: newStrategyName, strategyJSON: JSON.stringify(strategy) });
            action.setCallback(this, function (response) {
                if (cmp.isValid() && response.getState() === "SUCCESS") {
                    var id = response.getReturnValue();
                    var pollingId = window.setInterval(
                        $A.getCallback(function () {
                            helper.callDeployStatus(cmp, helper, true, false, sessionId, id, callback, pollingId);
                        }), 2000);
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
            var strategy = helper.beforeSave(event.getParam("strategy"));
            var newStrategyName = event.getParam("newStrategyName");
            var action = cmp.get("c.copyStrategyRequest");
            action.setParams({ sessionId: sessionId, newStrategyName: newStrategyName, strategyJSON: JSON.stringify(strategy) });
            action.setCallback(this, function (response) {
                if (cmp.isValid() && response.getState() === "SUCCESS") {
                    var id = response.getReturnValue();
                    var pollingId = window.setInterval(
                        $A.getCallback(function () {
                            helper.callDeployStatus(cmp, helper, true, false, sessionId, id, callback, pollingId);
                        }), 2000);
                }
                else {
                    callback({ error: response.getError()[0].message });
                }
            });
            $A.enqueueAction(action);
        });
    },

    //################################

    callRetrievalStatus: function (cmp, helper, sessionId, id, callback, pollingId) {
        var action = cmp.get("c.checkRetrievalStatusRequest");
        action.setParams({ sessionId: sessionId, id: id });
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                var retVal = response.getReturnValue();
                if (retVal) {
                    window.clearInterval(pollingId);
                    callback({ value: helper.afterLoad(retVal) });
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

    /** Clones object and returns a new copy
    * @param {bool} retrieveAffectedStrategy - flag that indicates if api call should return affected strategy. Usefull when calling update, 
    * so you get updated strategy without additional calls
    * @param {bool} isAsync - flag that indicates if any code is awaiting for the result. If True - callback should be called
    * @param {String} sessionId - auth token which is retrieved via VisualForce page hack. Required for any api call
    * @param {String} id - when deploy or retrieve api method is called we get back a JobId, which we can use to check deploy or retrieve status accordingly
    * @param {function} callback - a callback, which is originally passed with event. An object should be passed in callback, looking like this:
    * {
    *   error: '...'
    *   value: '....'
    * }
    * @param {String} pollingId - id returned from calling _window.setInterval. Used for removing recurring calls
    * @param {String} strategyNameAsync - strategy name, only used for async savinig. Required for keeping track of different strategies pending for saving
    */
    callDeployStatus: function (cmp, helper, retrieveAffectedStrategy, isAsync, sessionId, id, callback, pollingId, strategyNameAsync) {
        var action = cmp.get("c.checkDeployStatusRequest");
        action.setParams({ sessionId: sessionId, id: id, retrieveAffectedStrategy: retrieveAffectedStrategy });
        action.setCallback(this, function (response) {
            if (response.getState() === "SUCCESS") {
                var retVal = helper.afterLoad(response.getReturnValue());
                if (retVal || !retrieveAffectedStrategy) {
                    window.clearInterval(pollingId);

                    if (!isAsync)
                        callback({ value: retVal });
                    else {
                        cmp.set("v.savingStatus", 'up-to-date');
                        var pendingStrategy = helper.getQueuedStrategyForSaving(cmp, strategyNameAsync)
                        if (pendingStrategy) {
                            helper.setStrategyInQueueForSaving(cmp, strategyNameAsync, null);
                            helper.sendCreateOrUpdateRequest(cmp, helper, pendingStrategy, null, sessionId, callback, isAsync);
                        }
                        else {
                            cmp.set("v.isSaveRunning", false);
                            //I think here might be a race condition, so let's check once again
                            var pendingStrategy = helper.getQueuedStrategyForSaving(cmp, strategyNameAsync)
                            if (pendingStrategy) {
                                helper.setStrategyInQueueForSaving(cmp, strategyNameAsync, null);
                                helper.sendCreateOrUpdateRequest(cmp, helper, pendingStrategy, null, sessionId, callback, isAsync);
                            }
                        }
                    }
                }
                else {
                    //if the return value is null then it is still retrieving

                }
            }
            else {
                cmp.set("v.savingStatus", '');
                window.clearInterval(pollingId);
                _cmpUi.spinnerOff(cmp, "spinner");
                if (!isAsync)
                    callback({ error: response.getError()[0].message });
                else {

                    // inform to roll back
                    var cmpEvent = cmp.getEvent('mdStrategyRollbackRequest');
                    cmpEvent.setParams({ strategyName: strategyNameAsync, error: response.getError()[0].message });
                    cmpEvent.fire();

                    // deschedule pending savings
                    helper.setStrategyInQueueForSaving(cmp, strategyNameAsync, null);
                    cmp.set("v.isSaveRunning", false);
                }
            }

        });
        $A.enqueueAction(action);
    },

    ensureSessionIdIsLoaded: function (cmp, onRetrieved) {
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
    },

    getQueuedStrategyForSaving: function (cmp, strategyName) {
        if (!strategyName)
            return null;
        else {
            var result = cmp.get("v.strategiesForSaving." + strategyName);
            if (!result)
                result = null;
            return result;
        }
    },

    setStrategyInQueueForSaving: function (cmp, strategyName, strategy) {
        cmp.set("v.strategiesForSaving." + strategyName, strategy);
    },

    /** Takes strategy that we work with locally and prepares it to be saved */
    beforeSave: function (unprocessedStrategy) {
        if (!unprocessedStrategy) {
            return unprocessedStrategy;
        }
        var processedStrategy = _utils.clone(unprocessedStrategy, true);
        if (processedStrategy.externalConnections !== undefined) {
            if (processedStrategy.externalConnections) {
                processedStrategy.nodes = processedStrategy.externalConnections.concat(processedStrategy.nodes);
            }
            delete processedStrategy.externalConnections;
        }
        return processedStrategy;
    },
    /** Takes strategy that we got from the service and prepares it to work with */
    afterLoad: function (unprocessedStrategy) {
        if (!unprocessedStrategy) {
            return unprocessedStrategy;
        }
        var processedStrategy = _utils.clone(unprocessedStrategy, true);
        var nodes = [];
        var externalConnections = [];
        processedStrategy.nodes.forEach(function (item) {
            if (item.nodeType === _utils.NodeType.EXTERNAL_CONNECTION) {
                externalConnections.push(item);
            } else {
                nodes.push(item);
            }
        });
        processedStrategy.nodes = nodes;
        processedStrategy.externalConnections = externalConnections;
        return processedStrategy;
    }
})