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
                var cmpEvent = cmp.getEvent("loadStrategy");
                cmpEvent.fire();
            }; 
            reader.readAsText(file); 
        }
    }, 

    loadStrategy : function (cmp) {
        var action = cmp.get("c.parseStrategyString");
        action.setParams({ xml : cmp.get("v.strategyXML") });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();
                cmp.set("v.curStratCopy", result);
                cmp.set("v.curStrat", result);
            }
            var spinner = cmp.find("mySpinner");
            $A.util.toggleClass(spinner, "slds-hide");
        });
        $A.enqueueAction(action);
    },

    loadTreeStrategy : function (cmp) {
        var action = cmp.get("c.parseInputFile");
        action.setParams({ xml : cmp.get("v.strategyXML") });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();
                cmp.set("v.treeStart", result);
                cmp.set("v.treeItems", JSON.parse(result));               
            }
        });
        $A.enqueueAction(action);
    },

    onDragOver: function(component, event) { 
        event.preventDefault(); 
    }, 

    handleTreeSelect: function (component, event, helper) {
        //return name of selected tree item
        var myName = event.getParam("name");
        var curStrat = component.get("v.curStrat");
        curStrat.nodes.forEach(function(entry){
            if (entry.name === myName) {
                component.find("treeNodeItem").set("v.nodeItem", helper.clone(entry, true));
                component.find("treeNodeItem").set("v.originalNodeItemType", 
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
                      var originalNode = helper.clone(cmp.find("treeNodeItem").get("v.originalNodeItemType"), true);
                      cmp.find("treeNodeItem").set("v.nodeItem", originalNode);
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
