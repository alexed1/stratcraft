({
    canSelectNewStrategy: function (cmp, event, helper) {
        var args = event.getParam('arguments');
        var propertyPage = cmp.find('propertyPage');
        if (propertyPage.isDirty()) {
            helper.showUnsavedChangesDialog(args.commitCallback, args.reverseCallback);
        } else {
            args.commitCallback();
        }
    },

    selectNode: function (cmp, event, helper) {
        var newNodeName = event.getParam('arguments').name;
        helper.handleTreeNodeSelect(cmp, newNodeName);
    },

    handlePropertyPageSaveRequest: function (cmp, event, helper) {
        var propertyPage = cmp.find('propertyPage');
        if (!propertyPage.isDirty()) {
            return;
        }
        var strategy = cmp.get('v.currentStrategy');
        var newNode = event.getParam('newNodeState');
        var oldNode = event.getParam('originalNodeState');
        helper.raiseStrategyChangedEvent(cmp, strategy, oldNode, newNode, function () {
            propertyPage.reset();
        });
    },

    handleRefresh: function (cmp, event, helper) {
        helper.rebuildTree(cmp);
    },

    handleCurrentStrategyChanged: function (cmp, event, helper) {
        //Since we are selecting a different strategy, we need to clear the property page
        var propertyPage = cmp.find('propertyPage');
        propertyPage.currentNode = null;
        helper.rebuildTree(cmp);
    },
    /** Reacts to the selection of the new node in the tree */
    handleTreeNodeSelect: function (cmp, event, helper) {
        var newSelectedNodeName = event.getParam('name');
        helper.handleTreeNodeSelect(cmp, newSelectedNodeName);
    },
})
