({
    handleInit: function (component, event, helper) {
        var nodeDataRequestEvent = $A.get("e.c:nodeDataRequestEvent");
        nodeDataRequestEvent.setParams({
            "nodeRelationship": _utils.NodeRequestType.ALL,
            "callback": function (strategyNodes) {
                var result = [];
                strategyNodes.forEach(function (item) { result.push(item.name); });
                component.set('v.parentNodeNames', result);
            }
        });
        nodeDataRequestEvent.fire();
    },

    validate: function (component, event, helper) {
        var nodeNameCmp = component.find('nodeName');
        var parentNameCmp = component.find('parentNode');
        var baseValidationPassed = [nodeNameCmp, parentNameCmp].reduce(function (validSoFar, cmp) {
            cmp.showHelpMessageIfInvalid();
            return validSoFar && cmp.get('v.validity').valid;
        }, true);
        if (!baseValidationPassed) {
            return false;
        }
        var newNodeName = component.get('v.name');
        var nameIsInvalid = helper.isNodeNameEmptyOrWhitespace(newNodeName);
        if (nameIsInvalid) {
            nodeNameCmp.set(v.validity, { valid: false, valueMissing: true });
        }
        nameIsInvalid = helper.isNodeNameExists(newNodeName, component.get('v.parentNodeNames'));
        if (nameIsInvalid) {
            nodeNameCmp.set(v.validity, { valid: false, badInput: true });
        }
        return false;
    }
})
