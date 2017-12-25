({
	init : function(component, event, helper){

	},

	 // testing future logic for creating components
	handleCreateComponents : function(component, event, helper) { 
		 $A.createComponents(
        	[
			    ["ui:inputText",{
			    	"name" : "test1",
			    	"label" : "test3",
			        "value" : "12345"
			    }],
			    ["ui:inputText",{
			    	"name" : "test2",
			    	"label" : "test4",
			        "value" : "1234"
			    }]
		    ],
            function(components, status, errorMessage){
                //Add the new button to the body array
                if (status === "SUCCESS") {
					var body = component.get("v.body");
                    components.forEach(function(entry) {
                        body.push(entry);
                    });                    
                    
                    component.set("v.body", body);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                    // Show offline error
                }
                else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                    // Show error message
                }
            }
        );
	},

    handleUploadFinished: function (cmp, event) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam("files");
        alert("Files uploaded : " + uploadedFiles.length);
    },

    onDrop: function(component, event) { 
		event.stopPropagation(); 
		event.preventDefault(); 

		var files = event.dataTransfer.files; 
		for (var i = 0; i < files.length; i++) { 
			var file = files[i]; 
			var reader = new FileReader(); 
		
			reader.onloadend = function() { 
				console.log("uploaded file data is: " + reader.result); 		
				component.set("v.strategyXML", reader.result);
			}; 

			reader.readAsText(file); 
		} 
	}, 

	handleClick: function (cmp, event, helper) {
  		var action = cmp.get("c.parseStrategyString");
		action.setParams({ xml : cmp.get("v.strategyXML") });
		action.setCallback(this, function(response) {
			var state = response.getState();
			if (cmp.isValid() && state === "SUCCESS") {
				var result = response.getReturnValue();
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
