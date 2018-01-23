({
  displayToast: function (title, message, type) {
    var toast = $A.get("e.force:showToast");

    // For lightning1 show the toast
    if (toast) {
      //fire the toast event in Salesforce1
      toast.setParams({
        "title": title,
        "message": message,
        "type": type || "other",
        "duration": 8000
      });

      toast.fire();
    } else { // otherwise throw an alert
      alert(title + ': ' + message);
    }
  },

  toggleSpinner: function (cmp) {
    var spinner = cmp.find("mySpinner");
    $A.util.toggleClass(spinner, "slds-hide");
  },

  //REFACTOR these two calls should be one call
  convertXMLToStrategy: function (cmp, event, helper) {
    console.log('converting xml to Strategy object');
    var action = cmp.get("c.parseStrategyString");
    action.setParams({ xml: cmp.get("v.strategyXML") });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (cmp.isValid() && state === "SUCCESS") {
        var result = response.getReturnValue();
        cmp.set("v.curStratCopy", result);  //REFACTOR: this is probably a bad idea
        cmp.set("v.curStrat", result); //SMELLY: probably should define an object and not just use the entire response
        console.log('strategy is: ' + JSON.stringify(result));
        console.log('strategy is: ' + cmp.get("v.curStrat"));
      }
      var spinner = cmp.find("mySpinner");
      $A.util.toggleClass(spinner, "slds-hide");
    });
    $A.enqueueAction(action);
  },



  findStrategyNodeByName: function (strategy, name) {
    for (let curNode of strategy.nodes) {
      if (curNode.name == name) {
        return curNode;
      }
    };
    throw new Error("Did not find a Node with the requested Name, which is a big problem.");

  },

  findChildStrategyNodes: function (strategy, name) {
    var childNodes = [];
    for (let curNode of strategy.nodes) {
      if (curNode.parentNodeName == name) {
        childNodes.push(curNode);
      }
    };
    return childNodes;
  },

  clone: function (obj, deep) {
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

  validateParentNodeNotBlank: function (changedNode, errorList) {
    if (changedNode.parentNodeName == '') {
      errorList.push('Parent Node Name can not be blank');
    }
    return errorList;
  },



  validateNodeMove: function (cmp, curNode, changedNode) {
    var self = this;

    var errorList = [];
    errorList = self.validateParentNodeNotBlank(changedNode, errorList);

    var tree = cmp.find('tree');

    //Maybe we should pass 2 parameters here
    var treeErrors = tree.validateNodeUpdate(changedNode, curNode.name);

    return errorList.concat(treeErrors);
  },




  moveNode: function (cmp, curNode, changedNode) {
    var self = this;
    var validationErrors = self.validateNodeMove(cmp, curNode, changedNode);
    if (validationErrors.length > 0) {
      var errorText = JSON.stringify(validationErrors);
      var originalNode = self.clone(cmp.find("propertyPage").get("v.originalTreeNode"), true);
      cmp.find("propertyPage").set("v.selectedTreeNode", originalNode);
      self.displayToast('', errorText, 'error');
    }
    else {
      var tree = cmp.find('tree');
      tree.moveNode(curNode.parentNodeName, changedNode.parentNodeName, curNode.name);
      //seems like we should also be adjusting the strategy here, and not just the tree
    }
  },

  updateNodeName: function (cmp, curNode, changedNode) {
    var self = this;

    //first update the tree....
    var tree = cmp.find('tree');
    tree.renameNode(curNode, changedNode);

    //then update the strategy model
    //find any children of this node and update their parentNodeNames
    var curStrat = cmp.get("v.curStrat");
    var childNodes = self.findChildStrategyNodes(curStrat, curNode.name);
    childNodes.forEach(function (child) {
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

  },

  updateNodeParent: function (curNode, changedNode) {
    curNode.parentNodeName = changedNode.parentNodeName;
  },

  saveStrategyChanges: function (cmp, changedNode, originalNodeName, helper) {

    var curStrat = cmp.get("v.curStrat");
    var curNode = helper.findStrategyNodeByName(curStrat, originalNodeName);

    //if parent node was changed this is a move
    if (curNode.parentNodeName !== changedNode.parentNodeName) {
      helper.moveNode(cmp, curNode, changedNode);
      helper.updateNodeParent(curNode, changedNode);
    }

    //if name was changed - also need to update nodes that are children of current node
    if (curNode.name !== changedNode.name) {
      helper.updateNodeName(cmp, curNode, changedNode);
    }

    cmp.set("v.curStrat", curStrat);
  },

  //this method checks if there are unsaved changes when user selects another node
  //prompts user if he wants to save and saves, if so 
  handleUnsavedChanged: function (component, newSelectedNodeName, curStrat, helper, continueSelectionCallback) {
    var previousNodeName = component.find("propertyPage").get("v.originalName");

    var needChecking = previousNodeName && newSelectedNodeName && (previousNodeName != newSelectedNodeName);
    if (needChecking) {
      var dirtyNode = component.find("propertyPage").get("v.curNode");
      var originNode = helper.findStrategyNodeByName(curStrat, previousNodeName);
      var originNodeName = originNode.name;
      //possibly better to use underscore.js to compare 2 objects in a generic way
      var isDirty = !(helper.areUndefinedOrEqual(dirtyNode.name, originNode.name) &&
        helper.areUndefinedOrEqual(dirtyNode.description, originNode.description) &&
        helper.areUndefinedOrEqual(dirtyNode.parentNode, originNode.parentNode) &&
        helper.areUndefinedOrEqual(dirtyNode.type, originNode.type) &&
        helper.areUndefinedOrEqual(dirtyNode.definition, originNode.definition));

      if (isDirty) {
        component.find("unsavedChangesDialog").open("Unsaved changes!",
          "We noticed you have changed some of nodes parameters. Would you like to save your changes?",
          function (boolResult) {
            if (boolResult)
              helper.saveStrategyChanges(component, dirtyNode, originNodeName, helper);
            continueSelectionCallback();
          });
      }
      else
        continueSelectionCallback();
    }
    else
      continueSelectionCallback();
  },

  areUndefinedOrEqual: function (x, y) {
    var result =
      (x == null && y == null)  //either both are undefined
      || //or both has value and values are equal 
      ((x != null && y != null)
        //something in aura changes control characters and strings that look equal are not equal,
        //so we strip characters with regexp removing whitespaces, tabs and carriage returns and compare the rest
        && x.replace(/[\s]/gi, '') == y.replace(/[\s]/gi, ''));
    return result;
  }

})
