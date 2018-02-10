({
    init: function (cmp, event, helper) {
        helper.loadStrategyNames(cmp);

    },

    handleUploadFinished: function (cmp, event) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam("files");
        alert("Files uploaded : " + uploadedFiles.length);
    },

    handleStrategySelection: function (cmp, event, helper) {
        var strategyName = cmp.find('mySelect').get('v.value');
        console.log('value is: ' + strategyName);


        var  curStratXML = helper.loadStrategy(cmp, strategyName);

        console.log("exiting controller handle Strategy Selection");


    },

    handleMenuSelect: function (cmp, event, helper) {
        var selectedMenuItemValue = event.getParam("value");

        switch(selectedMenuItemValue) {
        case "load":
            //may be obsolete
           
            break;
        case "save":
            
            break;
        

        }
    },

    onDrop: function (cmp, event, helper) {
        event.stopPropagation();
        event.preventDefault();
        var reader = new FileReader();
        var files = event.dataTransfer.files;
        var spinner = cmp.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            reader = new FileReader();
            reader.onloadend = function () {
                console.log("uploaded file data is: " + reader.result);
                cmp.set("v.strategyRecord.StrategyXML__c", reader.result);

                var cmpEvent = cmp.getEvent("xmlFileUploaded");
                cmpEvent.fire();
            };
            reader.readAsText(file);
        }
    },

    //obsolete
    processLoadedXMLString: function (cmp, event, helper) {
        console.log('starting processing loaded xml string');
        //initialize the tree component
        var strategyXMLString = cmp.get("v.strategyRecord.StrategyXML__c");
        var tree = cmp.find('tree');
        tree.initialize(strategyXMLString);

        helper.convertXMLToStrategy(cmp, event, helper);

        console.log('completed processing of loaded xml string');
    },



    onDragOver: function (component, event) {
        event.preventDefault();
    },

    handleTreeNodeSelect: function (component, event, helper) {
        //return name of selected tree item
        var newSelectedNodeName = event.getParam("name");
        var curStrat = component.get("v.curStrat");

        var curNode = helper.findStrategyNodeByName(curStrat, newSelectedNodeName);

        //prompt user if he wants to continue navigation when the pane is dirty
        helper.handleUnsavedChanged(component, newSelectedNodeName, curStrat, helper, function () {
            if (curNode.name === newSelectedNodeName) {

                //continue navigation callback
                component.find("propertyPage").set("v.curNode", _utils.clone(curNode, true));
                component.find("propertyPage").set("v.originalName", newSelectedNodeName);
            }

        });
    },

    saveStrategy: function (component, event, helper) {
        console.log("in save strategy in parent controller");
        var originalNodeName = event.getParam("originalNodeName");
        var changedNode = event.getParam("changedStrategyNode");


        helper.saveStrategyChanges(component, changedNode, originalNodeName, helper);
        //helper.persistStrategy(component);
        
        

        //post the curStrat to the server
        //save it by name overwriting as necessary
        //return a status message
        helper.persistStrategy(component);

        
    },
})
