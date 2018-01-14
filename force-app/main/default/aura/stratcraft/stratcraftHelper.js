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
    
    checkForNewValidParents : function(cmp, originalTreeBranch, oldParent, newParent,
      oldName, newName) {
      var treeItems = cmp.get("v.treeItems");
      var nestedTreeItems = this.iterate(this.searchTreeBranch(treeItems[0], oldName));      
      var allTreeItems = this.iterate(treeItems[0]);
      allTreeItems.push('RootNode');

      var curStrat = cmp.get("v.curStrat");
      nestedTreeItems.push(newName);
      if (newParent == '') {
        return false;
      }

      for (var item in nestedTreeItems) {
        if (nestedTreeItems[item] === newParent) {
          return false;
        }
      }
      
      for (var item in allTreeItems) {
        if (allTreeItems[item] === newParent) {
          return true;
        }
      }
      
      return false;
    },

    changeAllChildNodeNames : function(cmp, originalTreeBranch, oldParent, newParent,
      oldName, newName) {
      var treeItems = cmp.get("v.treeItems");
        for (var i in treeItems[0].items) {
          if (treeItems[0].items[i].name === oldName) {
            for (var j in treeItems[0].items[i].items) {
              treeItems[0].items[i].items[j].parentNode = newName;
              treeItems[0].items[i].items[j].parentNodeName = newName;
            }
          }          
        }

        var curStrat = cmp.get("v.curStrat");
        curStrat.nodes.forEach(function(entry){
            if (entry.parentNodeName === oldName) {
                entry.parentNodeName = newName;
            }
        });
        cmp.set("v.treeItems", treeItems);
        cmp.set("v.curStrat", curStrat);
    },

    changeNodeName : function(cmp, originalNodeName, updatedNode) {
      var treeItems = cmp.get("v.treeItems");
      var changedNode = this.searchTreeBranch(treeItems[0], originalNodeName);
      changedNode.name = updatedNode.name;
      changedNode.label = updatedNode.name;
      cmp.set("v.treeItems", treeItems);
    },

    iterate : function(treeNode) {
      var treeStack = [];
      if ((treeNode.items !== undefined) && (treeNode.items.length !== 0)) {
        for (var i in treeNode.items) {
          treeStack.push(treeNode.items[i].name);
          var arr = this.iterate(treeNode.items[i]);
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
       if (self.checkForNewValidParents(cmp, 
                                        curNode, 
                                        curNode.parentNodeName, 
                                        changedNode.parentNodeName,
                                        curNode.name,
                                        changedNode.name
                                        )) {
            self.reparentTreeNode(cmp, curNode.name, changedNode.parentNodeName, curNode.parentNodeName);
        }
        else {
          var originalNode = self.clone(cmp.find("propertyPage").get("v.originalTreeNode"), true);
          cmp.find("propertyPage").set("v.selectedTreeNode", originalNode);
          self.displayToast('', 'Not Valid component', 'error');
        }    
    },

    updateNodeName: function(cmp, curNode, changedNode) {
      var self=this;
      self.changeAllChildNodeNames(cmp, 
                                            curNode, 
                                            curNode.parentNodeName, 
                                            changedNode.parentNodeName,
                                            curNode.name,
                                            changedNode.name
                                            );
      self.changeNodeName(cmp, originalNodeName, changedNode);
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
