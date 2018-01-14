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

        var curNode = helper.findStrategyNodeByName(curStrat, myName);
         
        //find the StrategyNode that has been selected, and then find its associated propertyPage, which is an instance of the BasePropertyPage control
        //set its attributes
        if (curNode.name === myName) {
            component.find("propertyPage").set("v.curNode", helper.clone(curNode, true));
            component.find("propertyPage").set("v.originalName", myName);
        }
        
    },

    saveStrategy : function(cmp, event, helper) {
        var originalNodeName = event.getParam("originalNodeName");
        var changedNode = event.getParam("changedStrategyNode");
        var curStrat = cmp.get("v.curStrat");

        var curNode = helper.findStrategyNodeByName(curStrat, originalNodeName);
        //if parent node was changed - validate it
        if (curNode.parentNodeName !== changedNode.parentNodeName) {
            helper.moveNode(cmp, curNode, changedNode);
                           
        }

        //if name was changed - check for all nodes that are children of current node
        if (curNode.name !== changedNode.name) {
            helper.updateNodeName(cmp,curNode,changedNode);
        }

        for (var i in curNode) {
          curNode[i] = changedNode[i];
        }
                        
         
        cmp.set("v.curStrat", curStrat);
    },
})
