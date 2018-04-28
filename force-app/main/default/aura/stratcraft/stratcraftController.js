({
    init: function (cmp, event, helper) {
        var counter = cmp.get('v._initializeCounter');
        if (counter > 0) {
            counter--;
            cmp.set('v._initializeCounter', counter);
        }
        if (counter === 0) {
            helper.loadStrategyNames(cmp);
            _undoManager.canUndo.addChangeHandler(function (newValue) { cmp.set('v.canUndo', newValue); });
            _undoManager.canRedo.addChangeHandler(function (newValue) { cmp.set('v.canRedo', newValue); })
        }
    },

    handleViewChanged: function (cmp, event, helper) {
        helper.toggleView(cmp);
    },

    handleCurrentStrategyChanged: function (cmp, event, helper) {
        var currentStrategy = cmp.get("v.currentStrategy");

        var inactiveView = helper.getInactiveView(cmp);
        inactiveView.refresh();
    },

    modalDialogLoaded: function (cmp, event, helper) {
        _modalDialog.initialize(cmp);
    },
    /** Handles selection of a new strategy */
    handleStrategySelection: function (cmp, event, helper) {
        helper.handleStrategySelection(cmp);
    },
    /** Handles strategy-node-related menu item click */
    handleMenuSelect: function (cmp, event, helper) {
        var selectedMenuItemValue = event.getParam('value');
        switch (selectedMenuItemValue) {
            case 'importStrategy':
                helper.showImportXMLDialog(cmp);
                break;
            case 'newStrategy':
                helper.showNewStrategyDialog(cmp);
                break;
            case 'saveStrategy':
                var propertyPage = cmp.find('propertyPage');
                var originalNodeState = propertyPage.get('v.currentNode');
                var actualNodeState = propertyPage.get('v._currentNodeDirty');
                helper.saveStrategy(cmp, originalNodeState, actualNodeState);
                break;
            case 'addElement':
                helper.showNewNodeDialog();
                break;
            case 'renameStrategy':
                helper.showRenameStrategyDialog(cmp);
                break;
            case 'copyStrategy':
                helper.copyStrategy(cmp);
                break;
            case 'deleteStrategy':
                helper.showDeleteStrategyDialog(cmp);
                break;
        }
    },
    /** Handles request for deletion of an existing node */
    handleNodeDeletionRequested: function (cmp, event, helper) {
        var node = event.getParam('node');
        var strategy = cmp.get('v.currentStrategy');
        if (!node.parentNodeName) {
            _force.displayToast('Error', 'Can\'t delete a root node', 'Error');
            return;
        }
        //This is done to avoid working with node proxy generated by environment
        node = _strategy.convertToNode(strategy, node.name);
        helper.showDeleteNodeDialog(strategy, node, cmp);
    },
    /** Handles request for creation of a new node */
    handleNewNodeCreationRequested: function (cmp, event, helper) {
        self = this;
        //When user confirms creation of the new node the below flow occurs:
        //1. newNodeCreationRequestedEvent is raised by the modal dialog
        //2. stratcraft handles it and adds new node to the current strategy
        //3. stratcraft then raise strategyChangedEvent
        //4. tree component handles it and adds a new node to itself
        //5. tree control raises a node selection event
        var nodeName = event.getParam('name');
        var nodeType = event.getParam('nodeType');
        var parentNodeName = event.getParam('parentNodeName');
        var strategy = cmp.get('v.currentStrategy');
        var newNode = {
            name: nodeName,
            parentNodeName: parentNodeName,
            nodeType: nodeType,
            description: ''
        };
        helper.saveStrategy(cmp, null, newNode, function () {
            var activeView = helper.getActiveView(cmp);
            if (activeView.selectNode) {
                activeView.selectNode(nodeName);
            }
        });
    },
    /** Handles request for related nodes, calculates the related nodes and pass it to the callback */
    handleNodeDataRequest: function (cmp, event, helper) {
        var nodeRelationship = event.getParam('nodeRelationship');
        var nodeName = event.getParam('nodeName');
        //Callback should be a function that accepts a single array argument which will contain the list of the requested nodes
        var callback = event.getParam('callback');
        var strategy = cmp.get('v.currentStrategy');
        var nodes = helper.getRelatedNodes(strategy, nodeRelationship, nodeName);
        if (!callback) {
            console.log('WARN: Node relationship was requested but the callback was not provided');
        }
        else {
            callback(nodes);
        }
    },

    saveStrategy: function (cmp, event, helper) {
        var originalNodeState = event.getParam('originalNodeState');
        var actualNodeState = event.getParam('newNodeState');
        helper.saveStrategy(cmp, originalNodeState, actualNodeState);
    },

    handleStrategyChanged: function (cmp, event, helper) {
        helper.saveStrategy(cmp, event.getParam('oldNode'), event.getParam('newNode'), event.getParam('confirmCallback'));
    },

    handleUndo: function (cmp, event, helper) {
        _undoManager.undo();
        var activeView = helper.getActiveView(cmp);
        activeView.refresh();
        helper.saveStrategy(cmp);
    },

    handleRedo: function (cmp, event, helper) {
        _undoManager.redo();
        var activeView = helper.getActiveView(cmp);
        activeView.refresh();
        helper.saveStrategy(cmp);
    }
})
