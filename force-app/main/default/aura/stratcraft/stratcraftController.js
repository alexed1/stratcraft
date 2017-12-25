({
	init : function(component, event, helper){

	},

	handleCreateComponents : function(component, event, helper) { 
		

		/*var testNode1String = "<strategyNode><name>RootNode</name><description>the root</description>" +
		"<parentNode></parentNode><type>2<!--Union--></type><definition>{ removeDuplicates: true }</definition>" +
		"</strategyNode>";
		var testNode2String = "<strategyNode><name>ChildNode</name><description>the root</description>" +
		"<parentNode>RootNode</parentNode><type>4<!--Union--></type><definition>{foo: true }</definition>" +
		"</strategyNode>";
		var testXMLFile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><RecommendationStrategy xmlns=\"http://soap.sforce.com/2006/04/metadata\"> " +
    	"<description>Test Strategy</description><recommendationStrategyName>testStrat1</recommendationStrategyName> " +
    	"<masterLabel>SomeMasterLabel</masterLabel>" + testNode1String + testNode2String + "</RecommendationStrategy>";

    	console.log(component.get("v.strategyXML"));*/

    	var str = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<RecommendationStrategy xmlns=\"http://soap.sforce.com/2006/04/metadata\">\r\n    <description>Test Strategy</description>\r\n    <recommendationStrategyName>testStrat1</recommendationStrategyName>\r\n    <masterLabel>SomeMasterLabel</masterLabel>\r\n\r\n\t<!-- Root -->\r\n\t<strategyNode>\r\n\t\t<name>RootNode</name>\r\n\t\t<description>the root</description>\r\n\t\t<parentNode></parentNode>\r\n\t\t<type>2<!--Union--></type>\r\n\t\t<definition>{ removeDuplicates: true }</definition>\r\n\t</strategyNode>\r\n\r\n\t<!-- Payment Past Due -->\r\n\t<strategyNode>\r\n\t\t<name>IfPaymentPastDueElseChurnNode</name>\r\n\t\t<description>If payment is past due request payment else churn</description>\r\n\t\t<parentNode>RootNode</parentNode>\r\n\t\t<type>4<!--If--></type>\r\n\t\t<definition>\r\n\t\t\t{\r\n\t\t\t\texpressions: {\r\n\t\t\t\t\t\"LoadPpd\": \"$Record.Contact.Payment_Due_Date__c &lt; (TODAY() - 30)\",\r\n\t\t\t\t\t\"LowCsatIfNode\": \"true\"},\r\n\t\t\t\tonlyFirstMatch: true\r\n\t\t\t}\r\n\t\t</definition>\r\n\t</strategyNode>\r\n\r\n</RecommendationStrategy>\r\n"

		var action = component.get("c.parseStrategyString");
		action.setParams({ xml : str /*component.get("v.strategyXML")*/ });
		action.setCallback(this, function(response) {
			var state = response.getState();
			if (component.isValid() && state === "SUCCESS") {
				var result = response.getReturnValue();
				result.nodes.forEach(function(entry) {
                    console.log(entry.name);     
					console.log(entry.description);	  
					console.log(entry.definition);	  
					console.log(entry.type);	  
					console.log(entry.parentNodeName);	  
				    console.log('++++');
                });
				console.log(result.name);
			}            
	  });
	  
      $A.enqueueAction(action);

		 /*$A.createComponents(
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
        );*/

	},

	getNodesData : function(component, event, helper) { 
		var action = component.get("c.parseStrategyString");
		action.setParams({ xml : component.get("v.strategyXML") });
		action.setCallback(this, function(response) {
			var state = response.getState();
			if (component.isValid() && state === "SUCCESS") {
				var result = response.getReturnValue();
				result.nodes.forEach(function(entry) {
                    console.log(entry.name);     
					console.log(entry.description);	  
					console.log(entry.definition);	  
					console.log(entry.type);	  
					console.log(entry.parentNodeName);	  
				    console.log('++++');
                });
				console.log(result.name);
			}            
	  });
	  
      $A.enqueueAction(action);
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
				console.log(result.name);
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
