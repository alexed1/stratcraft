({
    init: function (cmp, event, helper) {
        helper.loadStrategyNames(cmp);

    },

    hopscotchLoaded: function (cmp, event, helper) {
        helper.initHopscotch(cmp, event, helper);

    },

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
            case 'newNode':
                helper.showNewNodeDialog(cmp);
                break;
        }
    },

    handleNewNodeCreation: function (cmp, event, helper) {
        var nodeName = event.getParam('name');
        var parentNodeName = event.getParam('parentNodeName');
        var strategy = cmp.get('v.curStrat');
        strategy.nodes.push({
            name: nodeName,
            parentNodeName: parentNodeName,
            definition: '{ }',
            description: ''
        });
        cmp.find('tree').addNode(nodeName, parentNodeName);
        var cmpEvent = $A.get("e.c:treeNodeSelectedEvent");
        cmpEvent.setParams({
            "name": nodeName
        });
        cmpEvent.fire();
    },

    handleNodeDataRequest: function (cmp, event, helper) {
        var nodeRelationship = event.getParam('nodeRelationship');
        var nodeName = event.getParam('nodeName');
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
