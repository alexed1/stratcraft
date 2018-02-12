({
    handleInit: function (component, event, helper) {
        var nodeDataRequestEvent = $A.get('e.c:nodeDataRequestEvent');
        nodeDataRequestEvent.setParams({
            'nodeRelationship': _utils.NodeRequestType.ALL,
            'callback': function (strategyNodes) {
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
        var newNodeName = component.get('v.name');
        var nameIsInvalid = helper.isNodeNameEmptyOrWhitespace(newNodeName);
        if (nameIsInvalid) {
            nodeNameCmp.set("v.validity", {
                valid: false,
                badInput: false,
                valueMissing: true
            });
            parentNameCmp.focus();
            nodeNameCmp.focus();
            return false;
        }
        nameIsInvalid = helper.isNodeNameExists(newNodeName, component.get('v.parentNodeNames'));
        if (nameIsInvalid) {
            nodeNameCmp.set("v.validity", {
                valid: false,
                badInput: true,
                valueMissing: false
            });
            parentNameCmp.focus();
            nodeNameCmp.focus();
            return false;
        }
        nodeNameCmp.set("v.validity", {
            valid: true,
            badInput: false,
            valueMissing: false
        });
        return true;
    }
})
