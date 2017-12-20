({
    myAction : function(component, event, helper) {

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
		for (var i=0; i<files.length; i=i+1) { 
		var file = files[i]; 
		var reader = new FileReader(); 
		
		reader.onloadend = function(component, event) { 
			console.log('loaded');
			console.log("uploaded file data is: " + reader.result); 		
			component.set("v.strategyXML", reader.result);
		
		}; 

		reader.readAsText(file); 
		} 
	}, 

	onDragOver: function(component, event) { 
		event.preventDefault(); 
	}, 
 

})
