({
    handleTreeSelect: function (component, event, helper) {
        var cmpEvent = $A.get("e.c:treeNodeSelectedEvent");
        cmpEvent.setParams({
            "name": event.getParam('name')
        });
        cmpEvent.fire();
    },

    initializeTree: function (cmp, evt) {
        console.log('initializing tree ');

        var strategyXMLString = evt.getParam('arguments').strategyXMLString;
        var action = cmp.get("c.generateTreeData");
        action.setParams({ xml: strategyXMLString });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();
                cmp.set("v.treeItems", JSON.parse(result));
            }
        });
        $A.enqueueAction(action);
    },

    handleStrategyChanged: function (cmp, evt, helper) {
        var type = evt.getParam('type');
        var nodeName = evt.getParam('nodeName');
        var parentNodeName = evt.getParam('parentNodeName');
        switch (type) {
            case _utils.StrategyChangeType.ADD_NODE:
                helper.addNode(cmp, parentNodeName, nodeName);
                break;
            default:
                console.log('WARN: ' + type + ' strategy changed type is not supported yet');
        }
    },

    renameNode: function (cmp, evt, helper) {
        var curNode = evt.getParam('arguments').curNode;
        var changedNode = evt.getParam('arguments').changedNode;
        helper.updateTreeNodeChildren(cmp, curNode, changedNode);
        helper.updateTreeNode(cmp, curNode.name, changedNode);
    },

    moveNode: function (cmp, evt, helper) {
        var oldParentName = evt.getParam('arguments').oldParentName;
        var newParentName = evt.getParam('arguments').newParentName;
        var curNodeName = evt.getParam('arguments').curNodeName;
        helper.reparentTreeNode(cmp, curNodeName, newParentName, oldParentName);
    },

    validateNodeUpdate: function (cmp, evt, helper) {

        var changedNode = evt.getParam('arguments').changedNode;
        var curNodeName = evt.getParam('arguments').curNodeName;

        var errorList = [];
        var rootTreeItem = cmp.get("v.treeItems")[0];

        errorList = helper.validateNewParentNameIsNotADescendant(rootTreeItem, changedNode, errorList, curNodeName);
        errorList = helper.validateNewParentNameIsAnExtantNode(rootTreeItem, changedNode, errorList);
        return errorList;
    }
})
