({


  //Populates the select strategy drop down
  loadStrategyNames: function (cmp) {
    var action = cmp.get('c.getStrategyNames');
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (state === "SUCCESS") {
        //If we got at least one strategy, we add an empty name in the beginning of the list, so no strategy is selected by default
        var strategies = response.getReturnValue();
        if (!strategies || strategies.length === 0) {
          cmp.set('v.strategyNames', []);
        }
        else {
          cmp.set('v.strategyNames', [''].concat(strategies));
        }
      }
      else {
        console.log('Failed with state: ' + state);
      }
    });
    $A.enqueueAction(action);
  },


  //when a strategy is selected, load data from its Salesforce record
  loadStrategy: function (cmp, strategyName) {
    self = this;
    var action = cmp.get("c.loadStrategy");

    action.setParams({ name: strategyName });
    // Add callback behavior for when response is received
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (state === "SUCCESS") {
        var strategyRecord = response.getReturnValue();
        console.log('returning strategy XML: ' + strategyRecord.StrategyXML__c);
        cmp.set('v.strategyRecord', strategyRecord);
        // var strategyId = response.getReturnValue().Id;
        // cmp.set('v.strategyId', strategyId);
        console.log('returning strategy Id: ' + strategyRecord.Id);

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
    action.setParams({ xml: cmp.get("v.strategyRecord.StrategyXML__c") });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (cmp.isValid() && state === "SUCCESS") {
        var result = response.getReturnValue();
        if (result.notification.errors.length != 0) {
          //fix this to list all errors
          alert('error attempting to parse strategy XML into a strategy object: ' + result.notification.errors[0]);
        }
        else {
          result.Id = cmp.get("v.strategyRecord.Id");
          cmp.set("v.curStrat", result); //SMELLY: probably should define an object and not just use the entire response
          console.log('strategy is: ' + JSON.stringify(result));
          console.log('strategy is: ' + cmp.get("v.curStrat"));

          var tree = cmp.find('tree');
          tree.initialize(cmp.get("v.strategyRecord.StrategyXML__c"));
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

  //save the strategy as a Salesforce strategy object
  persistStrategy: function (cmp) {
    var self = this;
    console.log('sending Strategy to Salesforce and persisting');
    var action = cmp.get("c.persistStrategy");

    action.setParams({ curStratString: JSON.stringify(cmp.get("v.curStrat")) });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (cmp.isValid() && state === "SUCCESS") {

        var result = response.getReturnValue();
        //only show this if response indicates true success
        _force.displayToast("Strategy Crafter", "Strategy changes saved");
        console.log(' returned from persistStrategy: ' + result);

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

  //this updates the local model but does not persist the data to the server
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

    console.log("exiting saveStrategyChanges");


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

          component.find('modalDialog').showCustomModal({
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
  /**@param {object} component - A reference to stratcraft component
   * @param {string} header - Header of the modal window. Can be a component in the form 'c:componentName' or jsut a plain string
   * @param {string} body - Body of the modal window. Should be a component in the form 'c:componentName'
   * @param {function} validateCallback - Function that accepts modal body component and returns true if it is in a valid state to proceed
   * @param {function} okCallback - Function that accepts modal body component and is invoked when modal body component passed validation and modal window is closed
   */
  showDialog: function (component, header, body, validateCallback, okCallback) {
    //TODO: probably worth check the actual namespace
    var headerIsComponent = header && header.startsWith('c:');
    var componentsToCreate = [
      [body, {}],
      ['c:modalWindowFooter', {}]
    ];
    if (headerIsComponent) {
      componentsToCreate.unshift([header, {}]);
    }
    var modalDialog = component.find('modalDialog');
    $A.createComponents(componentsToCreate,
      function (components, status, errorMessage) {
        if (status === "SUCCESS") {
          var header = headerIsComponent ? components[0] : header;
          var body = headerIsComponent ? components[1] : components[0];
          var footer = headerIsComponent ? components[2] : components[1];
          footer.addEventHandler("buttonClickEvent", function (clickEvent) {
            var buttonClicked = clickEvent.getParam('Button');
            switch (buttonClicked) {
              case _utils.ModalDialogButtonType.OK:
                var isValid = validateCallback(body);
                if (isValid) {
                  okCallback(body);
                  modalDialog.notifyClose();
                }
                break;
              case _utils.ModalDialogButtonType.CANCEL:
                modalDialog.notifyClose();
                break;
            }
          });
          modalDialog.showCustomModal({
            header: header,
            body: body,
            footer: footer,
            showCloseButton: true
          });
        }
      });
  },

  showNewNodeDialog: function (component) {
    this.showDialog(component, 'New Node', 'c:modalNewNodeBody',
      function (bodyComponent) { return bodyComponent.validate(); },
      function (bodyComponent) {
        var newNodeEvent = $A.get('e.c:newNodeCreationRequestedEvent');
        newNodeEvent.setParams({
          'name': bodyComponent.get('v.name').trim(),
          'parentNodeName': bodyComponent.get('v.selectedParentNodeName')
        });
        newNodeEvent.fire();
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

  }/*,

  initHopscotch: function (cmp, event, helper) {

    var selectId = cmp.find("mySelect").getGlobalId();
    var treeId = cmp.find("tree").getGlobalId();

    var tour = {
      id: "hello-hopscotch",
      steps: [
        {
          title: "My Header",
          content: "This is the header of my page.",
          target: selectId,
          placement: "right"
        },
        {
          title: "My content",
          content: "Here is where I put my content.",
          target: treeId,
          placement: "bottom"
        }
      ]
    };

    // Start the tour!
    hopscotch.startTour(tour);
    }*/
})
