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
                cmp.set("v.copyStrat", result);
                console.log(result.name);
                result.nodes.forEach(function(entry){
                    console.log(entry.name);
                    console.log(entry.description);
                    console.log(entry.definition);
                    console.log(entry.type);
                });
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


    createStrategyNode : function(component, event) { 

    }, 

    onDragOver: function(component, event) { 
        event.preventDefault(); 
    }, 

    handleTreeSelect: function (component, event) {
        //return name of selected tree item
        var myName = event.getParam('name');
        var curStrat = component.get("v.curStrat");
        curStrat.nodes.forEach(function(entry){
            if (entry.name === myName) {
                component.set("v.curStratNode", entry);
            }
        });
    },

    saveStrategy : function (cmp, event, helper) {
        helper.toggleSpinner(cmp);
        
        var action = cmp.get("c.refreshStrategy");
        action.setParams({ strStrat : JSON.stringify(cmp.get("v.curStrat"))});
        
        action.setCallback(this, function(response) {
            if (response.getReturnValue().startsWith("Validation error")) {
                helper.displayToast('', response.getReturnValue(), 'error');
                helper.toggleSpinner(cmp);
                var copyStrat = cmp.get("v.copyStrat");
                cmp.set("v.curStrat", copyStrat);
            }
            else if (cmp.isValid() && response.getState() === "SUCCESS") {
                var result = response.getReturnValue();
                    cmp.set("v.treeStart", result);
                    var JSONResult = JSON.parse(result);
                    cmp.set("v.treeItems", JSONResult);
                    helper.toggleSpinner(cmp);                               
            }
        });
        $A.enqueueAction(action);
    },
})
