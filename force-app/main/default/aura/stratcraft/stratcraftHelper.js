({

  //populates the select strategy drop down
  loadStrategyNames: function (cmp) {
    // Create the action
    var action = cmp.get("c.getStrategyNames");

    // Add callback behavior for when response is received
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (state === "SUCCESS") {
        cmp.set("v.strategyNames", response.getReturnValue());
      }
      else {
        console.log("Failed with state: " + state);
      }
    });
    // Send action off to be executed
    $A.enqueueAction(action);
  },

  //when a strategy is selected, load xml from its Salesforce record
  loadStrategyXML: function (cmp, strategyName) {
    self = this;
    var action = cmp.get("c.loadStrategyXML");

    action.setParams({ name: strategyName });
    // Add callback behavior for when response is received
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (state === "SUCCESS") {
        var strategyXML = response.getReturnValue();
        console.log('returning strategy XML: ' + strategyXML);
        cmp.set('v.strategyXML', strategyXML);
        console.log('starting processing loaded xml string');
        self.convertXMLToStrategy(cmp, self);
      }
      else {
        console.log("Failed with state: " + state);
      }
    });
    // Send action off to be executed
    $A.enqueueAction(action);
  },

  convertXMLToStrategy: function (cmp, helper) {
    console.log('converting xml to Strategy object');
    var action = cmp.get("c.parseStrategyString");
    action.setParams({ xml: cmp.get("v.strategyXML") });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (cmp.isValid() && state === "SUCCESS") {
        var result = response.getReturnValue();
        if (result.notification.errors.length != 0) {
          //fix this to list all errors
          alert('first error: ' + result.notification.errors[0]);
        }
        else {
          cmp.set("v.curStratCopy", result);  //REFACTOR: this is probably a bad idea
          cmp.set("v.curStrat", result); //SMELLY: probably should define an object and not just use the entire response
          console.log('strategy is: ' + JSON.stringify(result));
          console.log('strategy is: ' + cmp.get("v.curStrat"));

          var tree = cmp.find('tree');
          tree.initialize(cmp.get("v.strategyXML"));
        }


      }
      else {
        console.log("Failed with state: " + state);
      }
      //for some reason this was hanging
      //_cmpUi.toggleSpinner();
      console.log('exiting convert xml to Strategy object');
    });
    $A.enqueueAction(action);
  },

  convertStrategyToXML: function (cmp) {
    console.log('converting Strategy to XML string');
    var action = cmp.get("c.assembleStrategyString");

    action.setParams({ curStrat: cmp.get("v.curStrat") });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (cmp.isValid() && state === "SUCCESS") {
        var xmlString = response.getReturnValue();
        cmp.set("v.xmlString", result);
        console.log('xmlString is: ' + result);
      }
      else {
        console.log("Failed with state: " + state);
      }
      //var spinner = cmp.find("mySpinner");
      //$A.util.toggleClass(spinner, "slds-hide");
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
      var originalNode = _utils.clone(cmp.find("propertyPage").get("v.originalTreeNode"), true);
      cmp.find("propertyPage").set("v.selectedTreeNode", originalNode);
      _force.displayToast('', errorText, 'error');
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

    cmp.set("v.curStrat", curStrat);

  },

  updateNodeBody: function (cmp, curNode, changedNode) {
    //var curStrat = cmp.get("v.curStrat");
    curNode.description = changedNode.description;
    curNode.type = changedNode.type;
    curNode.definition = changedNode.definition;
    //cmp.set("v.curStrat", curStrat);
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

    helper.updateNodeBody(cmp, curNode, changedNode);
    cmp.set("v.curStrat", curStrat);

    //fire this event so the property page knows to reset itself
    var propPage = cmp.find('propertyPage');
    propPage.reset();

  },

  loadStrategy: function (cmp) {

  },

  saveStrategy: function (cmp) {
    var self = this;
    //convert the string to xml
    var saveText = self.convertStrategyToXML(cmp);

  },

  //this method checks if there are unsaved changes when user selects another node
  //prompts user if he wants to continue navigation and calls callback if he agrees to continue
  handleUnsavedChanged: function (component, newSelectedNodeName, curStrat, helper, continueSelectionCallback) {
    var previousNodeName = component.find("propertyPage").get("v.originalName");

    var needChecking = previousNodeName && newSelectedNodeName;
    if (needChecking) {
      var dirtyNode = component.find("propertyPage").get("v.curNode");
      var originNode = helper.findStrategyNodeByName(curStrat, previousNodeName);
      var originNodeName = originNode.name;
      //possibly better to use underscore.js to compare 2 objects in a generic way
      var isDirty = !(helper.areUndefinedOrEqual(dirtyNode.name, originNode.name) &&
        helper.areUndefinedOrEqual(dirtyNode.description, originNode.description) &&
        helper.areUndefinedOrEqual(dirtyNode.parentNodeName, originNode.parentNodeName) &&
        helper.areUndefinedOrEqual(dirtyNode.type, originNode.type) &&
        helper.areUndefinedOrEqual(dirtyNode.definition, originNode.definition));

      if (isDirty) {
        helper.showUnsavedChangesDialog(component, continueSelectionCallback);
      }
      else
        continueSelectionCallback();
    }
    else
      continueSelectionCallback();
  },

  showUnsavedChangesDialog: function (component, continueSelectionCallback) {
    var modalBody;
    var modalFooter;
    $A.createComponents([
      ["c:unsavedChangesBody", {}],
      ["c:unsavedChangesFooter", {}]
    ],
      function (components, status) {
        if (status === "SUCCESS") {
          modalBody = components[0];
          modalFooter = components[1];
          var result = {};
          modalFooter.addEventHandler("c:unsavedChangesEvent", function (auraEvent) {
            result = auraEvent.getParam("result");
          })

          component.find('unsavedChangesDialog').showCustomModal({
            header: "Unsaved changes",
            body: modalBody,
            footer: modalFooter,
            showCloseButton: false,
            closeCallback: function () {
              if (result)
                continueSelectionCallback();
            }
          });
        }
      });
  },


  areUndefinedOrEqual: function (x, y) {
    var result =
      (x == null && y == null)  //either both are undefined
      || //or both has value and values are equal 
      ((x != null && y != null)
        //something in aura changes control characters and strings that look equal are not equal,
        //so we strip characters with regexp removing whitespaces, tabs and carriage returns and compare the rest
        //we also remove quotation marks, since we use unstrict json and the only difference there might be a presense of quotation marks
        && x.replace(/[\s\"]/gi, '') == y.replace(/[\s\""]/gi, ''));
    return result;
  }
})
