({
  /**Returns the list of current strategy nodes that relate in a specific way to a specified node
   * @param {object} strategy - Strategy
   * @param {string} nodeRelationship - Relationship type. For possible values see _utils.NodeRelationshipType
   * @param {string} nodeName - Name of node that requested nodes should be related to. Optional if the requested type is ALL
   */
  getRelatedNodes: function (strategy, nodeRelationship, nodeName) {
    var nodes = [];
    switch (nodeRelationship) {
      case _utils.NodeRequestType.ALL:
        nodes = strategy.nodes;
        break;
      case _utils.NodeRequestType.IMMEDIATE_DESCENDANTS:
        nodes = _strategy.getDirectChildrenNodes(strategy, nodeName);
        break;
      default:
        throw new Error('Node relationship type ' + nodeRelationship + ' is not yet supported');
    }
    return nodes;
  },
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
      href: ''
    }
  },

  buildTreeFromStrategy: function (strategy, currentNode) {
    self = this;
    if (!currentNode) {
      currentNode = strategy.nodes.find(function (node) {
        return !node.parentNodeName;
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
        var error = response.getError();
        console.log('Failed to save strategy: ' + JSON.stringify(error));
        _force.displayToast('Strategy Crafter', 'Failed to save strategy. ' + error[0].message, 'Error');
      }
    });
    $A.enqueueAction(action);
  },
  /**Validates if changes to the node are valid and can be applied to the strategy
   * @param {object} strategy - Current strategy
   * @param {object} originalNode - Original state of the node before change
   * @param {object} changedNode - Current state of the node after change
   */
  validateNodeChange: function (strategy, originalNode, changedNode) {
    self = this;
    if (changedNode.name == changedNode.parentNodeName) {
      return 'A node can\'t be a parent to itself';
    }
    if (originalNode.name != changedNode.name) {
      var sameNameNodes = strategy.nodes.filter(function (item) {
        return item.name.trim().toLowerCase() == changedNode.name.trim().toLowerCase();
      })
      if (sameNameNodes.length > 1) {
        return 'A node with the same name already exists';
      }
    }
    if (originalNode.parentNodeName != changedNode.parentNodeName) {
      var wasRoot = originalNode.parentNodeName == '';
      var isRoot = changedNode.parentNodeName == '';
      if (!wasRoot && isRoot) {
        return 'A strategy can\'t have two root nodes';
      }
    }
    return null;
  },

  /**Compares original and actual node states, updates this node in strategy and trigger the tree rebuilding
   * @param {object} component - A reference to stratcraft component
   * @param {object} originalNode - Original state of the node before change
   * @param {object} changedNode - Current state of the node after change
   */
  applyChangesToStrategy: function (strategy, originalNode, changedNode) {
    self = this;
    var isNameChanged = originalNode.name != changedNode.name;
    var isParentChanged = originalNode.parentNodeName != changedNode.parentNodeName;
    var originalParent = _strategy.getParentNode(strategy, originalNode);
    //Update parent of original children
    if (isNameChanged) {
      var originalChildren = _strategy.getDirectChildrenNodes(strategy, originalNode);
      originalChildren.forEach(function (item) {
        item.parentNodeName = changedNode.name;
      });
      //If parent node refers the current one in one of its branches, we should update this branch
      //If original parent is empty then we are renaming the root node
      if (originalParent && originalParent.nodeType == _utils.NodeType.IF) {
        if (originalParent.branches) {
          originalParent.branches.forEach(function (item) {
            if (item.child == originalNode.name) {
              item.child = changedNode.name;
            }
          });
        }
      }
    }
    //Update children
    if (isParentChanged) {
      //TODO: process the case where empty node is selected as a new parent
      var isMovingToOwnChild = _strategy.isParentOf(strategy, originalNode.name, changedNode.parentNodeName);
      if (isMovingToOwnChild) {
        originalChildren.forEach(function (item) {
          item.parentNodeName = originalParent.name;
        });
      }
      //There is no 'else' as in this case changedNode will already have changes and will be injected into strategy
    }
    var index = strategy.nodes.findIndex(function (item) { return item.name == originalNode.name; });
    strategy.nodes[index] = changedNode;
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
