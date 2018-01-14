({
    init : function(component, event, helper){

    },

    handleUploadFinished: function (cmp, event) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam("files");
        alert("Files uploaded : " + uploadedFiles.length);
    },

    onDrop: function(cmp, event, helper) { 
        event.stopPropagation(); 
        event.preventDefault(); 
        var reader = new FileReader();
        var files = event.dataTransfer.files; 
        var spinner = cmp.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
        for (var i = 0; i < files.length; i++) { 
            var file = files[i]; 
            reader = new FileReader(); 
            reader.onloadend = function() { 
                console.log("uploaded file data is: " + reader.result);
                cmp.set("v.strategyXML", reader.result);
                var cmpEvent = cmp.getEvent("xmlFileUploaded");
                cmpEvent.fire();
            }; 
            reader.readAsText(file); 
        }
    }, 
    processLoadedXMLString : function (cmp, event, helper) { 
        console.log('starting processing loaded xml string');
        helper.generateTreeData(cmp, event, helper);
        helper.convertXMLToStrategy(cmp, event, helper);

        console.log('completed processing of loaded xml string');
    },

   

    onDragOver: function(component, event) { 
        event.preventDefault(); 
    }, 

    handleTreeNodeSelect: function (component, event, helper) {
        //return name of selected tree item
        var myName = event.getParam("name");
        var curStrat = component.get("v.curStrat");
        curStrat.nodes.forEach(function(entry){ //refactor. no need to iterate through ever node when only 1 can have the name. need a Find function that searches Nodes
            //find the StrategyNode that has been selected, and then find its associated treeNodeItem, which is an instance of the BasePropertyPage control
            //set both the selected and original attributes equal to clones of this StrategyNode.
            if (entry.name === myName) {
                component.find("propertyPage").set("v.selectedTreeNode", helper.clone(entry, true));
                component.find("propertyPage").set("v.originalTreeNode", 
                                                    helper.clone(entry, true));
            }
        });
    },

    testUpdateEvt : function(cmp, event, helper) {
        var originalNodeName = event.getParam("originalNodeName");
        var updatedNode = event.getParam("updatedTreeNode");
        var curStrat = cmp.get("v.curStrat");

        curStrat.nodes.forEach(function(entry){
            if (entry.name === originalNodeName) {
                //if parent node was changed - validate it
                if (entry.parentNodeName !== updatedNode.parentNodeName) {
                    if (helper.checkForNewValidParents(cmp, 
                                                    entry, 
                                                    entry.parentNodeName, 
                                                    updatedNode.parentNodeName,
                                                    entry.name,
                                                    updatedNode.name
                                                    )) {
                        helper.reparentTreeNode(cmp, entry.name, updatedNode.parentNodeName, entry.parentNodeName);
                    }
                    else {
                      var originalNode = helper.clone(cmp.find("propertyPage").get("v.originalTreeNode"), true);
                      cmp.find("propertyPage").set("v.selectedTreeNode", originalNode);
                      helper.displayToast('', 'Not Valid component', 'error');
                    }                    
                }

                //if name was changed - check for all nodes that are children of current node
                if (entry.name !== updatedNode.name) {
                    helper.changeAllChildNodeNames(cmp, 
                                                    entry, 
                                                    entry.parentNodeName, 
                                                    updatedNode.parentNodeName,
                                                    entry.name,
                                                    updatedNode.name
                                                    );
                    helper.changeNodeName(cmp, originalNodeName, updatedNode);
                }

                for (var i in entry) {
                  entry[i] = updatedNode[i];
                }
                                
            }
        });
        cmp.set("v.curStrat", curStrat);
    },
})
