({
    displayToast : function (title, message, type) {
      var toast = $A.get("e.force:showToast");
 
      // For lightning1 show the toast
      if (toast) {
          //fire the toast event in Salesforce1
          toast.setParams({
              "title": title,
              "message": message,
              "type": type || "other",
              "duration" : 8000
          });
 
          toast.fire();
      } else { // otherwise throw an alert
          alert(title + ': ' + message);
      }
    },  

    toggleSpinner : function(cmp) {
      var spinner = cmp.find("mySpinner");
      $A.util.toggleClass(spinner, "slds-hide");
    }, 

    //REFACTOR these two calls should be one call
    convertXMLToStrategy : function (cmp, event, helper) {
        console.log('converting xml to Strategy object');
        var action = cmp.get("c.parseStrategyString");
        action.setParams({ xml : cmp.get("v.strategyXML") });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();
                cmp.set("v.curStratCopy", result);  //REFACTOR: this is probably a bad idea
                cmp.set("v.curStrat", result); //SMELLY: probably should define an object and not just use the entire response
                console.log('strategy is: ' + JSON.stringify(result));
                console.log('strategy is: ' +  cmp.get("v.curStrat"));
            }
            var spinner = cmp.find("mySpinner");
            $A.util.toggleClass(spinner, "slds-hide");
        });
        $A.enqueueAction(action);
    },

   

    findStrategyNodeByName : function(strategy, name){
      for (let curNode of strategy.nodes){ 
          if (curNode.name == name) {
            return curNode;
          }
      };
      throw new Error("Did not find a Node with the requested Name, which is a big problem.");
   
    },

    findChildStrategyNodes : function(strategy, name){
      var childNodes = [];
      for (let curNode of strategy.nodes){ 
          if (curNode.parentNodeName == name) {
            childNodes.push(curNode);
          }
      };
      return childNodes;        
    },

    clone : function(obj, deep) {
      var newObj = new Object();
       
      if (obj instanceof Date) {
        newObj = new Date(obj);
      }
      else if (!deep && obj instanceof Array) {
         newObj = obj.slice(0);
      }
      else {
        for (var i in obj) {
          if (i == 'clone') continue;
          if (deep && typeof obj[i] == "object") {
            newObj[i] = obj[i].clone();
          } else {
            newObj[i] = obj[i];
          }
        } 
      }
      return newObj;
    },

    validateParentNodeNotBlank : function(changedNode, errorList){
      if (changedNode.parentNodeName == '') {
        errorList.push('Parent Node Name can not be blank');
      }
      return errorList;
    },

   
    
    validateNodeMove : function(cmp, curNode, changedNode) {
      var self=this;
 
      var errorList = [];
      errorList = self.validateParentNodeNotBlank(changedNode,errorList);
    
      var tree = cmp.find('tree');

      //Maybe we should pass 2 parameters here
      var treeErrors = tree.validateNodeUpdate(curNode.parentNodeName, changedNode, curNode.name);
          
      return errorList.concat(treeErrors);
    },


    

    moveNode: function(cmp, curNode, changedNode) {
       var self = this;
       var validationErrors = self.validateNodeMove(cmp, curNode, changedNode);
       if (validationErrors.length>0) {
          var errorText = JSON.stringify(validationErrors);
          var originalNode = self.clone(cmp.find("propertyPage").get("v.originalTreeNode"), true);
          cmp.find("propertyPage").set("v.selectedTreeNode", originalNode);
          self.displayToast('', errorText, 'error');
        }
        else {
          var tree = cmp.find('tree');
          tree.moveNode(curNode.parentNodeName, changedNode.parentNodeName, curNode.name)
          //seems like we should also be adjusting the strategy here, and not just the tree
        }  
    },

    updateNodeName: function(cmp, curNode, changedNode) {
      var self=this;

      //first update the tree....
      var tree = cmp.find('tree');
      tree.renameNode(curNode, changedNode);

      //then update the strategy model
      //find any children of this node and update their parentNodeNames
      var curStrat = cmp.get("v.curStrat");
      var childNodes = self.findChildStrategyNodes(curStrat,curNode.name);     
      childNodes.forEach(function(child) {
              child.parentNodeName = changedNode.name;
          }

      );
      //finally, update the node itself
      //REFACTOR: rename this function to highlight expanded scope?
      curNode.name = changedNode.name;
      curNode.description = changedNode.description;
      curNode.type = changedNode.type;
      curNode.definition = changedNode.definition;
      cmp.set("v.curStrat", curStrat);

    }

    
})
