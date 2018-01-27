({
    init: function (component, event, helper) {

    },

    handleUploadFinished: function (cmp, event) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam("files");
        alert("Files uploaded : " + uploadedFiles.length);
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
                cmp.set("v.strategyXML", reader.result);
                var cmpEvent = cmp.getEvent("xmlFileUploaded");
                cmpEvent.fire();
            };
            reader.readAsText(file);
        }
    },
    processLoadedXMLString: function (cmp, event, helper) {
        console.log('starting processing loaded xml string');
        //initialize the tree component
        var strategyXMLString = cmp.get("v.strategyXML");
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

        //find the StrategyNode that has been selected, and then find its associated propertyPage, which is an instance of the BasePropertyPage control

        if (curNode.name === newSelectedNodeName) {
            //prompt user if he wants to save changes when the pane is dirty
            helper.handleUnsavedChanged(component, newSelectedNodeName, curStrat, helper, function () {
                //set its attributes
                component.find("propertyPage").set("v.curNode", helper.clone(curNode, true));
                component.find("propertyPage").set("v.originalName", newSelectedNodeName);
            });

        }

    },

    saveStrategy: function (component, event, helper) {
        var originalNodeName = event.getParam("originalNodeName");
        var changedNode = event.getParam("changedStrategyNode");

        helper.saveStrategyChanges(component, changedNode, originalNodeName, helper);
    },
})
