({
    handleTreeSelect: function (cmp, event, helper) {
        var nodeName = event.getParam('name');
        var nodeSelectedEvent = cmp.getEvent('nodeSelected');
        nodeSelectedEvent.setParams({
            'name': nodeName
        });
        nodeSelectedEvent.fire();
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
