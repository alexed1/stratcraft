({
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

    reparentTreeNode : function(cmp, nodeName, parentNodeName, oldParentNodeName) {
      var treeItems = cmp.get("v.treeItems");

      var treeBranchToReparent = this.searchTreeBranch(treeItems[0], nodeName);
      if ((treeBranchToReparent === undefined) && (nodeName === treeItems[0].name)) {
        treeBranchToReparent = treeItems[0];
      }

      var parentTreeBranch = this.searchTreeBranch(treeItems[0], parentNodeName);
      if ((parentTreeBranch === undefined) && (parentNodeName === treeItems[0].name)) {
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

      parentTreeBranch.items.push(treeBranchToReparent);
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

     //trying to move a node to a new position under one of its children is problematic
    validateNewParentNameIsNotADescendant : function(rootName, changedNode, errorList, originalName){
      var self = this;
      var newParentName = changedNode.parentNodeName;

      //descendantTreeItemNameList is a flat stack of all the tree items underneath the current one
      var descendantTreeItemNameList = self.generateTreeItemDescendantNameList(self.searchTreeBranch(rootName, originalName));
      descendantTreeItemNameList.push(changedNode.name); //parent can't be the same as the node name

      for (var name in descendantTreeItemNameList) {
        if (descendantTreeItemNameList[name] === newParentName) {
          errorList.push("You can't set the Parent Node Name to be the same as an existing child node (or to be the current node name)");
        }
      }
      return errorList;
    },

    validateNewParentNameIsAnExtantNode : function(rootName, changedNode, errorList){
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
         errorList.push("You have to set the Parent Node Name to be the same as an existing node name");
      }

      return errorList;
    },

})
