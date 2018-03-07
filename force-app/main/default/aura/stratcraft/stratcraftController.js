({
    init: function (cmp, event, helper) {
        helper.loadStrategyNames(cmp);
    },

    /*hopscotchLoaded: function (cmp, event, helper) {
        helper.initHopscotch(cmp, event, helper);

    },*/

    handleUploadFinished: function (component, event) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam('files');
        alert('Files uploaded : ' + uploadedFiles.length);
    },
    /** Handles selection of a new strategy */
    handleStrategySelection: function (component, event, helper) {
        helper.ensureEmptyStrategyIsRemoved(component);

        var currentStrategy = component.get('v.currentStrategy');
        var newStrategyName = component.get('v.selectedStrategyName');
        //If we try to select the same strategy that is already selected, we do nothing
        //This may happen e.g. if we are selecting a new strategy, but the current one has unsaved changes and user decided to cancel the selection
        if (currentStrategy && currentStrategy.name === newStrategyName) {
            return;
        }
        //Since we are selecting a different strategy, we need to clear the property page
        var propertyPage = component.find('propertyPage');
        var proceedToSelect = function () {
            propertyPage.clear();
            if (newStrategyName) {
                helper.loadStrategy(component, newStrategyName);
            }
            else {
                component.set('v.currentStrategy', null);
            }
        };
        var reverseSelection = function () {
            component.set('v.selectedStrategyName', currentStrategy.name);
        };
        if (propertyPage.isDirty()) {
            helper.showUnsavedChangesDialog(component, proceedToSelect, reverseSelection);
        }
        else {
            proceedToSelect();
        }
    },
    /** Handles strategy-node-related menu item click */
    handleMenuSelect: function (component, event, helper) {
        var selectedMenuItemValue = event.getParam('value');
        switch (selectedMenuItemValue) {
            case 'newStrategy':
                alert('This functionality is not implemented yet');
                break;
            case 'saveStrategy':
                var propertyPage = component.find('propertyPage');
                var originalNodeState = propertyPage.get('v.currentNode');
                var actualNodeState = propertyPage.get('v._currentNodeDirty');
                helper.saveStrategy(component, originalNodeState, actualNodeState);
                break;
            case 'addElement':
                helper.showNewNodeDialog(component);
                break;
        }
    },
    /** Handles request for deletion of an existing node */
    handleNodeDeletionRequested: function (component, event, helper) {
        var node = event.getParam('node');
        var strategy = component.get('v.currentStrategy');
        if (!node.parentNodeName) {
            _force.displayToast('Error', 'Can\'t delete a root node', 'Error');
            return;
        }
        helper.showDeleteNodeDialog(component, strategy, node);
    },
    /** Handles request for creation of a new node */
    handleNewNodeCreationRequested: function (component, event, helper) {
        //When user confirms creation of the new node the below flow occurs:
        //1. newNodeCreationRequestedEvent is raised by the modal dialog
        //2. stratcraft handles it and adds new node to the current strategy
        //3. stratcraft then raise strategyChangedEvent
        //4. tree component handles it and adds a new node to itself
        //5. tree control raises a node selection event
        var nodeName = event.getParam('name');
        var nodeType = event.getParam('nodeType');
        var parentNodeName = event.getParam('parentNodeName');
        var strategy = component.get('v.currentStrategy');
        strategy.nodes.push({
            name: nodeName,
            parentNodeName: parentNodeName,
            nodeType: nodeType,
            description: ''
        });
        component.set('v.currentStrategy', strategy);
        var newNodeEvent = $A.get('e.c:strategyChangedEvent');
        newNodeEvent.setParams({
            'type': _utils.StrategyChangeType.ADD_NODE,
            'nodeName': nodeName,
            'parentNodeName': parentNodeName
        });
        newNodeEvent.fire();
    },
    /** Handles request for related nodes, calculates the related nodes and pass it to the callback */
    handleNodeDataRequest: function (component, event, helper) {
        var nodeRelationship = event.getParam('nodeRelationship');
        var nodeName = event.getParam('nodeName');
        //Callback should be a function that accepts a single array argument which will contain the list of the requested nodes
        var callback = event.getParam('callback');
        var strategy = component.get('v.currentStrategy');
        var nodes = helper.getRelatedNodes(strategy, nodeRelationship, nodeName);
        if (!callback) {
            console.log('WARN: Node relationship was requested but the callback was not provided');
        }
        else {
            callback(nodes);
        }
    },
    /** Reacts to the selection of the new node in the tree */
    handleTreeNodeSelect: function (component, event, helper) {
        var newSelectedNodeName = event.getParam('name');
        var currentStrategy = component.get('v.currentStrategy');
        var newSelectedNode = _strategy.getNode(currentStrategy, newSelectedNodeName);
        var propertyPage = component.find('propertyPage');
        var proceeedToSelect = function () {
            propertyPage.set('v.currentNode', newSelectedNode);
        }
        if (propertyPage.isDirty()) {
            //TODO: provide cancel callback that will switch the selected node back to the original (i.e. visually highlight it)
            helper.showUnsavedChangesDialog(component, proceeedToSelect);
        }
        else {
            proceeedToSelect();
        }
    },

    saveStrategy: function (component, event, helper) {
        var originalNodeState = event.getParam('originalNodeState');
        var actualNodeState = event.getParam('newNodeState');
        helper.saveStrategy(component, originalNodeState, actualNodeState);
    },

    handleViewChanged: function (component, event, helper) {
        var isGraphInitialized = component.get('v._isGraphInitialized');
        var isTreeView = component.get('v.isTreeView');
        var strategy = component.get('v.currentStrategy');
        var graphContainer = component.find('graphContainer');
        var treeContainer = component.find('treeContainer');
        var graphScrollView = component.find('graphView');
        $A.util.toggleClass(graphScrollView, 'slds-hide');
        $A.util.toggleClass(treeContainer, 'slds-hide');
        if (isGraphInitialized) {
            if (!isTreeView) {
                window.setTimeout($A.getCallback(function () { helper.rebuildStrategyGraph(strategy); }));
            } else {
                helper.clearGraph();
            }
        } else {
            window.setTimeout($A.getCallback(function () {
                helper.initializeGraph();
                component.set('v._isGraphInitialized', true);
                helper.rebuildStrategyGraph(strategy);
            }));
        }
    }
})
