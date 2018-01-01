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
                cmp.set("v.curStrat", result);
                console.log(result.name);
                result.nodes.forEach(function(entry){
                    console.log(entry.name);
                    console.log(entry.description);
                    console.log(entry.definition);
                    console.log(entry.type);
                });
                console.log(result);
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
                var JSONResult = JSON.parse(result);
                cmp.set("v.treeItems", JSONResult);
                console.log(result);
                
            }
        });
        $A.enqueueAction(action);
    },


    createStrategyNode : function(component, event) { 

    }, 

    onDragOver: function(component, event) { 
        event.preventDefault(); 
    }, 



})
