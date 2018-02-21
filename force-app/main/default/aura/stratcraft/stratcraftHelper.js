({
  //Populates the select strategy drop down
  loadStrategyNames: function (component) {
    var action = component.get('c.getStrategyNames');
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (state === 'SUCCESS') {
        //If we got at least one strategy, we add an empty name in the beginning of the list, so no strategy is selected by default
        var strategies = response.getReturnValue();
        if (!strategies || strategies.length === 0) {
          component.set('v.strategyNames', []);
        }
        else {
          component.set('v.strategyNames', [''].concat(strategies));
        }
      }
      else {
        console.log('Failed with state: ' + state);
      }
    });
    $A.enqueueAction(action);
  },

  convertNodeToTreeItem: function (baseNode) {
    return {
      name: baseNode.name,
      expanded: true,
      items: [],
      label: baseNode.name,
      href: '#' + baseNode.name
    }
  },

  buildTreeFromStrategy: function (strategy, currentNode) {
    self = this;
    if (!currentNode) {
      currentNode = strategy.nodes.find(function (node) {
        return node.name === 'RootNode'
      });
    }
    var treeItem = this.convertNodeToTreeItem(currentNode);
    var childNodes = strategy.nodes.filter(function (node) {
      return node.parentNodeName === currentNode.name
    });

    childNodes.forEach(function (childNode) {
      var childTreeItem = self.buildTreeFromStrategy(strategy, childNode);
      treeItem.items.push(childTreeItem);
    });
    return treeItem;
  },
  //when a strategy is selected, loads data from its Salesforce record
  loadStrategy: function (component, strategyName) {
    self = this;
    var action = component.get('c.loadStrategy');
    action.setParams({ name: strategyName });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (state === 'SUCCESS') {
        var strategy = response.getReturnValue();
        component.set('v.currentStrategy', strategy);
        component.find('tree').set('v.treeItems', [this.buildTreeFromStrategy(strategy)]);
        console.log('Retrieved strategy with Id ' + strategy.Id);
      }
      else {
        console.log('Failed to retrieve strategy with state: ' + state);
      }
    });
    $A.enqueueAction(action);
  },
  //save the strategy as a Salesforce strategy object
  persistStrategy: function (component) {
    console.log('Sending Strategy to Salesforce and persisting');
    var action = component.get('c.persistStrategy');
    action.setParams({ strategyJson: JSON.stringify(component.get('v.currentStrategy')) });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (component.isValid() && state === 'SUCCESS') {
        var result = response.getReturnValue();
        //only show this if response indicates true success
        _force.displayToast('Strategy Crafter', 'Strategy changes saved');
        console.log(' returned from persistStrategy: ' + result);
      }
      else {
        console.log('Failed with state: ' + state);
      }
    });
    $A.enqueueAction(action);
  },

  findStrategyNodeByName: function (strategy, name) {
    for (let node of strategy.nodes) {
      if (node.name == name) {
        return node;
      }
    };
    throw new Error('Did not find a Node with the requested name');
  },

  findChildStrategyNodes: function (strategy, name) {
    var childNodes = [];
    for (let node of strategy.nodes) {
      if (node.parentNodeName == name) {
        childNodes.push(node);
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
      var originalNode = _utils.clone(cmp.find('propertyPage').get('v.originalTreeNode'), true);
      cmp.find('propertyPage').set('v.selectedTreeNode', originalNode);
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
    var currentStrategy = cmp.get('v.currentStrategy');
    var childNodes = self.findChildStrategyNodes(currentStrategy, curNode.name);
    childNodes.forEach(function (child) {
      child.parentNodeName = changedNode.name;
    }

    );
    //finally, update the node itself
    //REFACTOR: rename this function to highlight expanded scope?
    curNode.name = changedNode.name;

    cmp.set('v.currentStrategy', currentStrategy);

  },

  updateNodeBody: function (cmp, curNode, changedNode) {
    //var currentStrategy = cmp.get('v.currentStrategy');
    curNode.description = changedNode.description;
    curNode.type = changedNode.type;
    //cmp.set('v.currentStrategy', currentStrategy);
  },

  updateNodeParent: function (curNode, changedNode) {
    curNode.parentNodeName = changedNode.parentNodeName;
  },

  //this updates the local model but does not persist the data to the server
  saveStrategyChanges: function (cmp, changedNode, originalNodeName, helper) {

    var currentStrategy = cmp.get('v.currentStrategy');
    var curNode = helper.findStrategyNodeByName(currentStrategy, originalNodeName);

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
    cmp.set('v.currentStrategy', currentStrategy);

    //fire this event so the property page knows to reset itself
    var propPage = cmp.find('propertyPage');
    propPage.reset();

    console.log('exiting saveStrategyChanges');


  },
  /** Converts the incoming parameter to the format used by showDialog method */
  parseComponentConfiguration: function (configuration) {
    if (!configuration) {
      return configuration;
    }
    var result = { name: '', initializer: null };
    if (Array.isArray(configuration)) {
      result.name = configuration[0];
      result.isComponent = true;
      result.initializer = configuration[1];
    }
    else {
      result.name = configuration;
      result.isComponent = configuration.startsWith('c:');
    }
    return result;
  },

  /**@param {object} component - A reference to stratcraft component
   * @param {object} header - Header of the modal window. Can be one of the following:
   * - plain string: will be displayed as is
   * - component name (starts with namespace:): specified component will be created and used
   * - array: first element of array is treated as component name, second is treated as an initializer function that accepts newly created component
   * @param {object} body - Body of the modal window. Can be one of the following:
   * - plain string: will be displayed as is
   * - component name (starts with namespace:): specified component will be created and used
   * - array: first element of array is treated as component name, second is treated as an initializer function that accepts newly created component
   * @param {function} okCallback - Function that accepts modal body component and is invoked when modal body component passed validation and modal window is closed
   * @param {function} validateCallback - (Optional)Function that accepts modal body component and returns true if it is in a valid state to proceed
   * @param {function} cancelCallback - (Optional)Function that is invoked when modal window is closed without validation
   * @example: Examples for header and body:
   * 'This text will be shown as is'
   * 'c:myComponentName'
   * ['c:myComponentName', function (component) { component.set('v.name', 'Initial value for the name property')}]
   */
  showDialog: function (component, header, body, okCallback, validateCallback, cancelCallback) {
    if (!okCallback) {
      throw new Error('OK callback is not provided. Use force:showToast for notification that don\'t block UI');
    }
    //TODO: probably worth check the actual namespace
    var headerConfiguration = this.parseComponentConfiguration(header);
    var bodyConfiguration = this.parseComponentConfiguration(body);
    var componentsToCreate = [
      ['c:modalWindowFooter', {}]
    ];
    if (bodyConfiguration.isComponent) {
      componentsToCreate.unshift([bodyConfiguration.name, {}]);
    }
    if (headerConfiguration.isComponent) {
      componentsToCreate.unshift([headerConfiguration.name, {}]);
    }
    var modalDialog = component.find('modalDialog');
    $A.createComponents(componentsToCreate,
      function (components, status, errorMessage) {
        if (status === 'SUCCESS') {
          //Footer is always the last, body is always next to the last, header is always the first
          var footer = components[components.length - 1];
          header = headerConfiguration.isComponent ? components[0] : headerConfiguration.name;
          body = bodyConfiguration.isComponent ? components[components.length - 2] : bodyConfiguration.name;

          if (headerConfiguration.isComponent && headerConfiguration.initializer) {
            headerConfiguration.initializer(header);
          }
          if (bodyConfiguration.isComponent && bodyConfiguration.initializer) {
            bodyConfiguration.initializer(body);
          }

          footer.addEventHandler('buttonClickEvent', function (clickEvent) {
            var buttonClicked = clickEvent.getParam('Button');
            switch (buttonClicked) {
              case _utils.ModalDialogButtonType.OK:
                var isValid = !validateCallback || validateCallback(body);
                if (isValid) {
                  okCallback(body);
                  modalDialog.notifyClose();
                }
                break;
              case _utils.ModalDialogButtonType.CANCEL:
                if (cancelCallback) {
                  cancelCallback();
                }
                modalDialog.notifyClose();
                break;
            }
          });
          modalDialog.showCustomModal({
            header: header,
            body: body,
            footer: footer,
            //In this case if we provide cancellation callback, we don't allow user to just close the window, as we are interested in the councious choice 
            showCloseButton: cancelCallback === null || cancelCallback === undefined
          });
        }
      });
  },

  showNewNodeDialog: function (component) {
    this.showDialog(
      component,
      'New Node',
      'c:modalNewNodeBody',
      function (bodyComponent) {
        var newNodeEvent = $A.get('e.c:newNodeCreationRequestedEvent');
        newNodeEvent.setParams({
          'name': bodyComponent.get('v.name').trim(),
          'nodeType': bodyComponent.get('v.nodeType'),
          'parentNodeName': bodyComponent.get('v.selectedParentNodeName')
        });
        newNodeEvent.fire();
      },
      function (bodyComponent) { return bodyComponent.validate(); });
  },

  showUnsavedChangesDialog: function (component, okCallback, cancelCallback) {
    this.showDialog(
      component,
      'Unsaved changes',
      ['c:modalWindowGenericBody', function (body) {
        body.set('v.text', 'The selected node has unsaved changes. Do you want to discard those changes and proceeed?');
        body.set('v.iconName', _force.Icons.Action.Question);
      }],
      okCallback,
      null,
      cancelCallback);
  },

  /**Makes sure that an empty option in the strategy selection list is removed
   * @param {object} component - a reference to a stratcraft component
   */
  ensureEmptyStrategyIsRemoved: function (component) {
    var strategyNames = component.get('v.strategyNames');
    if (strategyNames && strategyNames.length > 0 && strategyNames[0] === '') {
      strategyNames = strategyNames.slice(1);
      component.set('v.strategyNames', strategyNames);
    }
  }
  /*,

  initHopscotch: function (cmp, event, helper) {

    var selectId = cmp.find('mySelect').getGlobalId();
    var treeId = cmp.find('tree').getGlobalId();

    var tour = {
      id: 'hello-hopscotch',
      steps: [
        {
          title: 'My Header',
          content: 'This is the header of my page.',
          target: selectId,
          placement: 'right'
        },
        {
          title: 'My content',
          content: 'Here is where I put my content.',
          target: treeId,
          placement: 'bottom'
        }
      ]
    };

    // Start the tour!
    hopscotch.startTour(tour);
    }*/
})
