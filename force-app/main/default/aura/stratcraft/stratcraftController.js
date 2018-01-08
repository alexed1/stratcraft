({
    init : function(cmp, event, helper){
		var items = [{
            "label": "Western Sales Director",
            "name": "Western Sales Director",
            "expanded": true,
            "items": [{
                "label": "Western Sales Manager",
                "name": "Western Sales Manager",
                "expanded": true,
                "items" :[{
                    "label": "CA Sales Rep",
                    "name": "CA Sales Rep",
                    "expanded": true,
                    "items" : []
                },{
                    "label": "OR Sales Rep",
                    "name": "OR Sales Rep",
                    "expanded": true,
                    "items" : []
                }]
            }]
        }, {
            "label": "Eastern Sales Director",
            "name": "Eastern Sales Director",
            "expanded": false,
            "items": [{
                "label": "Easter Sales Manager",
                "name": "Easter Sales Manager",
                "expanded": true,
                "items" :[{
                    "label": "NY Sales Rep",
                    "name": "NY Sales Rep",
                    "expanded": true,
                    "items" : []
                }, {
                    "label": "MA Sales Rep",
                    "name": "MA Sales Rep",
                    "expanded": true,
                    "items" : []
                }]
            }]
        }];
        cmp.set('v.items', items);
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


    createStrategyNode : function(component, event) { 

    }, 

    onDragOver: function(component, event) { 
        event.preventDefault(); 
    }, 
	
	
	
	handleMenuSelect: function(cmp, event, helper) {
		var selectedMenuItemValue = event.getParam("value");
	},
	
	handleSelect: function (cmp, event, helper) {
        //return name of selected tree item
        var myName = event.getParam('name');
        console.log("You selected: " + myName);
		cmp.set('v.body', myName)
    },
    
})
