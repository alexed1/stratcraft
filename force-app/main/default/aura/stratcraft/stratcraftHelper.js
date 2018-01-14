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

    generateTreeData : function (cmp, event, helper) {
        console.log('generating tree data');
        var action = cmp.get("c.generateTreeData");
        action.setParams({ xml : cmp.get("v.strategyXML") });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (cmp.isValid() && state === "SUCCESS") {
                var result = response.getReturnValue();
                //cmp.set("v.treeStart", result); not being used
                cmp.set("v.treeItems", JSON.parse(result));               
            }
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

    validateParentNodeNotBlank : function(changedNode, notificationList){
      if (changedNode.parentNodeName == '') {
        notificationList.push('Parent Node Name can not be blank');
      }
      return notificationList;
    },

    //trying to move a node to a new position under one of its children is problematic
    validateNewParentNameIsNotADescendant : function(rootTreeItem, changedNode, notificationList, originalName){
      var self = this;
      var newParentName = changedNode.parentNodeName;

      //descendantTreeItemNameList is a flat stack of all the tree items underneath the current one
      var descendantTreeItemNameList = self.generateTreeItemDescendantNameList(self.searchTreeBranch(rootTreeItem, originalName));
      descendantTreeItemNameList.push(changedNode.name); //why?

      for (var name in descendantTreeItemNameList) {
        if (descendantTreeItemNameList[name] === newParentName) {
          notificationList.push("You can't set the Parent Node Name to be the same as an existing child node");
        }
      }
      return notificationList;
    },

    validateNewParentNameIsAnExtantNode : function(rootName, changedNode, notificationList){
      var self = this;
      var newParentName = changedNode.parentNodeName;

      //allTreeItemNameList is a flat stack of all of the tree nodes      
      var allTreeItemNameList = this.generateTreeItemDescendantNameList(rootName);
      allTreeItemNameList.push('RootNode');
     
      //search the existing nodes for the proposed parent name
      var nodeExists = false;
      for (var name in allTreeItemNameList) {
        if (allTreeItemNameList[name] === newParentName) {
          nodeExists = true;
        }
      }

      if (nodeExists ==false) {
         notificationList.push("You have to set the Parent Node Name to be the same as an existing node name");
      }

      return notificationList;
    },
    
    validateNodeMove : function(cmp, curNode, changedNode) {
      var self=this;
 
      var notificationList = [];
      notificationList = self.validateParentNodeNotBlank(changedNode,notificationList);
      
      var rootTreeItem = cmp.get("v.treeItems")[0];
      notificationList = self.validateNewParentNameIsNotADescendant(rootTreeItem, changedNode,notificationList, curNode.name);
      notificationList = self.validateNewParentNameIsAnExtantNode(rootTreeItem, changedNode,notificationList);
      
      return notificationList;
    },

    updateTreeNodeChildren : function(cmp, curNode, changedNode) {
      var treeItems = cmp.get("v.treeItems");
      for (var i in treeItems[0].items) {
          if (treeItems[0].items[i].name === curNode.name) {
            for (var j in treeItems[0].items[i].items) {
              treeItems[0].items[i].items[j].parentNode = changedNode.name;
              treeItems[0].items[i].items[j].parentNodeName = changedNode.name;
            }
          }          
        }
      cmp.set("v.treeItems", treeItems);


     
    },



    updateTreeNode : function(cmp, originalNodeName, updatedNode) {
      var treeItems = cmp.get("v.treeItems");
      var curTreeNode = this.searchTreeBranch(treeItems[0], originalNodeName);
      curTreeNode.name = updatedNode.name;
      curTreeNode.label = updatedNode.name;
      cmp.set("v.treeItems", treeItems);
    },

    //recursively walks the descendants of a tree node and returns a stack
    generateTreeItemDescendantNameList : function(treeNode) {
      var treeStack = [];
      if ((treeNode.items !== undefined) && (treeNode.items.length !== 0)) {
        for (var i in treeNode.items) {
          treeStack.push(treeNode.items[i].name);
          var arr = this.generateTreeItemDescendantNameList(treeNode.items[i]);
          for (var elem in arr) {
            if (arr[elem] != "") {
              treeStack.push(arr[elem]);
            }
          }          
        }
      }
      return treeStack;
    }, 

    searchTreeBranch : function(treeNode, nodeName) {
      if ((treeNode.items !== undefined) && (treeNode.items.length !== 0)) {
        for (var i in treeNode.items) {
          if (treeNode.items[i].name === nodeName) {
            return treeNode.items[i];
          }
          var nodeResult = this.searchTreeBranch(treeNode.items[i], nodeName);
          if ((nodeResult !== undefined) && (nodeResult.length !== 0)) {
              return nodeResult;
          }    
        }
      }
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
          self.reparentTreeNode(cmp, curNode.name, changedNode.parentNodeName, curNode.parentNodeName);
        }  
    },

    updateNodeName: function(cmp, curNode, changedNode) {
      var self=this;

      //first update the tree....
      self.updateTreeNodeChildren(cmp, curNode, changedNode );
      self.updateTreeNode(cmp, curNode.name, changedNode);

      //then update the strategy model
      //find any children of this node and update their parentNodeNames
      var curStrat = cmp.get("v.curStrat");
      var childNodes = self.findChildStrategyNodes(curStrat,curNode.name);     
      childNodes.forEach(function(child) {
              child.parentNodeName = changedNode.name;
          }

      );
    
      cmp.set("v.curStrat", curStrat);

    },

    reparentTreeNode : function(cmp, nodeName, parentNodeName, oldParentNodeName) {
      var treeItems = cmp.get("v.treeItems");

      var treeBranchToReparent = this.searchTreeBranch(treeItems[0], nodeName);
      if ((treeBranchToReparent === undefined) && (nodeName === treeItems[0].name)) {
        treeBranchToReparent = treeItems[0];
      }

      var parentTreeBranch = this.searchTreeBranch(treeItems[0], parentNodeName);
      if ((parentTreeBranch === undefined) && (parentTreeBranch === treeItems[0].name)) {
        parentTreeBranch = treeItems[0];
      }
      var treeBranchToSplice = this.searchTreeBranch(treeItems[0], oldParentNodeName);
      if (treeBranchToSplice === undefined) {
        treeBranchToSplice = treeItems[0];
      }

      for (var i in treeBranchToSplice.items) {
        if (treeBranchToSplice.items[i].name === nodeName) {
          treeBranchToSplice.items.splice(i,1);
        }
      }

      treeBranchToReparent.parentNode = parentNodeName;
      parentTreeBranch.items.push(treeBranchToReparent);
      cmp.set("v.treeItems", treeItems);
    },
})
