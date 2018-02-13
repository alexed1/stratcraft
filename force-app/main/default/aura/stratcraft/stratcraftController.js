({
    init: function (cmp, event, helper) {
        helper.loadStrategyNames(cmp);

    },

    /*hopscotchLoaded: function (cmp, event, helper) {
        helper.initHopscotch(cmp, event, helper);

    },*/

    handleUploadFinished: function (cmp, event) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam('files');
        alert('Files uploaded : ' + uploadedFiles.length);
    },

    handleStrategySelection: function (cmp, event, helper) {

        var strategyName = cmp.get('v.selectedStrategyName');
        var strategyNames = cmp.get('v.strategyNames');
        //If we had at least one existing strategy at an empty option is still in the beginning of the list, we remove it
        //so it can no longer be selected
        if (strategyNames && strategyNames.length > 0 && strategyNames[0] === '') {
            strategyNames = strategyNames.slice(1);
            cmp.set('v.strategyNames', strategyNames);
        }
        //TODO: handle unsaved changes
        //Since we are selecting a different strategy, we need to clear the property page
        var propertyPageCmp = cmp.find('propertyPage');
        if (!propertyPageCmp) {
            throw new Error('Property page component was not found');
        }
        propertyPageCmp.set('v.curNode', null);
        propertyPageCmp.clear();
        helper.loadStrategy(cmp, strategyName);
    },

    handleMenuSelect: function (cmp, event, helper) {
        var selectedMenuItemValue = event.getParam('value');
        switch (selectedMenuItemValue) {
            case 'newStrategy':
                alert('This functionality is not implemented yet');
                break;
            case 'saveStrategy':
                helper.persistStrategy(cmp);
                break;
            case 'addElement':
                helper.showNewNodeDialog(cmp);
                break;
        }
    },
    //When user confirms creation of the new node the below flow occurs:
    //1. newNodeCreationRequestedEvent is raised by the modal dialog
    //2. stratcraft handles it and adds new node to the current strategy
    //3. stratcraft then raise strategyChangedEvent
    //4. tree component handles it and adds a new node to itself
    //5. tree control raises a node selection event
    handleNewNodeCreationRequested: function (cmp, event, helper) {
        var nodeName = event.getParam('name');
        var parentNodeName = event.getParam('parentNodeName');
        var strategy = cmp.get('v.curStrat');
        strategy.nodes.push({
            name: nodeName,
            parentNodeName: parentNodeName,
            definition: '{ }',
            description: ''
        });
        cmp.set('v.curStrat', strategy);
        var newNodeEvent = $A.get('e.c:strategyChangedEvent');
        newNodeEvent.setParams({
            'type': _utils.StrategyChangeType.ADD_NODE,
            'nodeName': nodeName,
            'parentNodeName': parentNodeName
        });
        newNodeEvent.fire();
    },

    //Reacts to the request for related nodes, calculates the related nodes and pass it to the callback
    handleNodeDataRequest: function (cmp, event, helper) {
        var nodeRelationship = event.getParam('nodeRelationship');
        var nodeName = event.getParam('nodeName');
        //Callback should be a function that accepts a single array argument which will contain the list of the requested nodes
        var callback = event.getParam('callback');
        var strategy = cmp.get('v.curStrat');
        var nodes = [];
        switch (nodeRelationship) {
            case _utils.NodeRequestType.ALL:
                nodes = strategy.nodes;
                break;
            default:
                throw new Error('Node relationship type ' + nodeRelationship + ' is not yet supported');
        }
        if (!callback) {
            console.log('WARN: Node relationship was requested but the callback was not provided');
        }
        else {
            callback(nodes);
        }
    },

    handleTreeNodeSelect: function (component, event, helper) {
        //return name of selected tree item
        var newSelectedNodeName = event.getParam('name');
        var curStrat = component.get('v.curStrat');

        var curNode = helper.findStrategyNodeByName(curStrat, newSelectedNodeName);

        //prompt user if he wants to continue navigation when the pane is dirty
        helper.handleUnsavedChanged(component, newSelectedNodeName, curStrat, helper, function () {
            if (curNode.name === newSelectedNodeName) {

                //continue navigation callback
                component.find('propertyPage').set('v.curNode', _utils.clone(curNode, true));
                component.find('propertyPage').set('v.originalName', newSelectedNodeName);
            }

        });
    },

    saveStrategy: function (component, event, helper) {
        console.log('in save strategy in parent controller');
        var originalNodeName = event.getParam('originalNodeName');
        var changedNode = event.getParam('changedStrategyNode');


        helper.saveStrategyChanges(component, changedNode, originalNodeName, helper);

        //post the curStrat to the server
        //save it by name overwriting as necessary
        //return a status message
        helper.persistStrategy(component);


    }


})
