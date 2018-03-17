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
    var self = this;
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
    var self = this;
    var action = component.get('c.loadStrategy');
    action.setParams({ name: strategyName });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (state === 'SUCCESS') {
        var strategy = response.getReturnValue();
        component.set('v.currentStrategy', strategy);
        component.find('tree').set('v.treeItems', [this.buildTreeFromStrategy(strategy)]);
        var isTreeView = component.get('v.isTreeView');
        if (isTreeView) {
          self.clearDiagram();
        }
        else {
          self.rebuildStrategyDiagram(component, strategy);
        }
        console.log('Retrieved strategy with Id ' + strategy.Id);
      }
      else {
        console.log('Failed to retrieve strategy with state: ' + state);
      }
    });
    $A.enqueueAction(action);
  },

  saveStrategy: function (component, originalNodeState, actualNodeState, onSuccess) {
    console.log('in save strategy in parent controller');
    var strategy = component.get('v.currentStrategy');
    //This scenario describes changes to the strategy that came from altering the node properties    
    if (originalNodeState && actualNodeState) {
      var validationResult = this.validateNodeChange(strategy, originalNodeState, actualNodeState);
      if (validationResult) {
        _force.displayToast('Error', validationResult, 'error');
        return;
      }
      this.applyChangesToStrategy(strategy, originalNodeState, actualNodeState);
    }
    //Another possible scenario is when strategy structure is changed (e.g. node is added or removed) but in this case there is nothing to validate
    //TODO: check that the node it sill selected
    //Fire this event so the property page knows to reset itself
    component.find('propertyPage').reset();
    var newTree = this.buildTreeFromStrategy(strategy);
    component.find('tree').set('v.treeItems', [newTree]);
    //If we currently see a diagram, we need to rebuild it
    var isTreeView = component.get('v.isTreeView');
    if (!isTreeView) {
      self.rebuildStrategyDiagram(component, component.get('v.currentStrategy'));
    }
    //post the current strategy to the server
    //save it by name overwriting as necessary
    //return a status message
    self = this;
    this.persistStrategy(component, $A.getCallback(function () {
      //This is to close modal dialog with base property page if a save was triggered from it
      _modalDialog.close();
      if (onSuccess) {
        onSuccess();
      }
    }));
  },

  //save the strategy as a Salesforce strategy object
  persistStrategy: function (component, onSuccess) {
    console.log('Sending Strategy to Salesforce and persisting');
    var action = component.get('c.persistStrategy');
    action.setParams({ strategyJson: JSON.stringify(component.get('v.currentStrategy')) });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (component.isValid() && state === 'SUCCESS') {
        var result = response.getReturnValue();
        //only show this if response indicates true success
        _force.displayToast('Strategy Crafter', 'Strategy changes saved', 'info', 1000);
        console.log(' returned from persistStrategy: ' + result);
        if (onSuccess) {
          onSuccess();
        }
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
    var self = this;
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
      var wasRoot = !originalNode.parentNodeName;
      var isRoot = !changedNode.parentNodeName;
      if (!wasRoot && isRoot) {
        return 'A strategy can\'t have two root nodes';
      }
      //This is for the case where we move root node to one of its children. This leads to its direct children to lose the root as a parent
      //and becoming roots themselves but we don't allow more than one root
      if (wasRoot && _strategy.getDirectChildrenNodes(strategy, originalNode).length > 1) {
        return 'A strategy can\'t have more than one root';
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
    var self = this;
    var isNameChanged = originalNode.name != changedNode.name;
    var isParentChanged = originalNode.parentNodeName != changedNode.parentNodeName;
    var originalParent = _strategy.getParentNode(strategy, originalNode);
    var originalChildren = _strategy.getDirectChildrenNodes(strategy, originalNode);
    //Update parent of original children
    if (isNameChanged) {
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
          item.parentNodeName = originalParent ? originalParent.name : '';
        });
      }
      //There is no 'else' as in this case changedNode will already have changes and will be injected into strategy
    }
    var index = strategy.nodes.findIndex(function (item) { return item.name == originalNode.name; });
    strategy.nodes[index] = changedNode;
  },

  showDeleteNodeDialog: function (strategy, node) {
    var self = this;
    var hasChildren = _strategy.hasChildrenNodes(strategy, node);
    var question = 'Are you sure you want to delete this node';
    if (hasChildren) {
      question = question + ' and all its children?';
    }
    else {
      question = question + '?';
    }
    question = question + ' This can\'t be undone';
    _modalDialog.show(
      'Confirm Node Deletion',
      ['c:modalWindowGenericBody', function (body) {
        body.set('v.text', question);
        body.set('v.iconName', _force.Icons.Action.Delete);
      }],
      function (bodyComponent) {
        _strategy.deleteNode(strategy, node);
        self.saveStrategy(component, null, null, function () {
          component.find('propertyPage').set('v.currentNode', null);
          //This is to close modal dialog with base property page if a save was triggered from it
          _modalDialog.close();
        });
      }
    )
  },

  showNewNodeDialog: function () {
    _modalDialog.show(
      'New Node',
      'c:modalNewNodeBody',
      function (bodyComponent) {
        var newNodeEvent = $A.get('e.c:newNodeCreationRequestedEvent');
        newNodeEvent.setParams({
          'name': bodyComponent.get('v.name').trim(),
          'nodeType': bodyComponent.get('v.selectedNodeType'),
          'parentNodeName': bodyComponent.get('v.selectedParentNodeName')
        });
        newNodeEvent.fire();
      },
      function (bodyComponent) { return bodyComponent.validate(); });
  },

  showUnsavedChangesDialog: function (okCallback, cancelCallback) {
    _modalDialog.show(
      'Unsaved changes',
      ['c:modalWindowGenericBody', function (body) {
        body.set('v.text', 'The selected node has unsaved changes. Do you want to discard those changes and proceeed?');
        body.set('v.iconName', _force.Icons.Action.Question);
      }],
      okCallback,
      null,
      cancelCallback);
  },

  showNodePropertiesDialog: function (strategy, strategyNode) {
    _modalDialog.show(
      'Node Properties',
      ['c:basePropertyPage', function (body) {
        body.set('v.currentStrategy', strategy);
        body.set('v.currentNode', strategyNode);
      }]);
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
  },

  initializeDiagram: function () {
    var container = document.getElementsByClassName('diagram-container')[0];
    jsPlumb.setContainer(container);
  },

  clearDiagram: function () {
    var container = document.getElementsByClassName('diagram-container')[0];
    jsPlumb.reset();
    while (container.firstChild) {
      var firstChild = container.firstChild;
      firstChild.removeEventListener('click', firstChild.clickHandler);
      delete firstChild.clickHandler;
      container.removeChild(firstChild);
    }
  },

  rebuildStrategyDiagram: function (component, strategy) {
    self = this;
    this.clearDiagram();
    var container = document.getElementsByClassName('diagram-container')[0];
    var containerScrollView = document.getElementsByClassName('diagram-scroll-view')[0];
    if (strategy) {
      var treeLayout = _jsplumbWalker.buildTreeLayout(strategy);
      //This is the adjustment step in order to put the whole tree in the middle of the container
      //(and adjust the size of the container if it is less than the width of the tree)
      container.style.width = treeLayout.width + 'px';
      container.style.height = treeLayout.height + 'px';
      if (containerScrollView.clientHeight > treeLayout.height) {
        container.style.marginTop = container.style.marginBottom = (containerScrollView.clientHeight - treeLayout.height - containerScrollView.style.padding) / 2 - 21 + 'px';
      }
      else {
        container.style.marginTop = container.style.marginBottom = 'inherit';
      }
      var queue = [];
      queue.push({
        layoutNode: treeLayout.root,
        visualNode: self.createNode(component, container, strategy, treeLayout.root)
      });
      jsPlumb.batch(function () {
        var parentVisualNode = null;
        while (queue.length > 0) {
          var parentNodePair = queue.shift();
          parentNodePair.layoutNode.children.forEach(function (item) {
            var childNodePair = {
              layoutNode: item,
              visualNode: self.createNode(component, container, strategy, item)
            };
            jsPlumb.connect({
              source: childNodePair.visualNode,
              target: parentNodePair.visualNode,
              anchors: ['Right', 'Left'],
              endpoint: 'Blank',
              connector: 'Flowchart',
              overlays: [
                ['Arrow', { width: 8, length: 8, location: 1, foldback: 1 }]
              ]
            });
            queue.push(childNodePair);
          });
        }
      });
      //It means that drag-n-drop is already configured
      if (container.drake) {
        return;
      }
      var drake = dragula([container], {
        moves: function (parent, container, handle) {
          return parent.classList.contains('node');
        },
        mirrorContainer: container
      });
      drake.on('drag', function (element, container, source) {
        var nodes = Array.from(container.getElementsByClassName('node'));
        var draggedNodeName = element.dataset.nodeName;
        var directParent = _strategy.getParentNode(strategy, draggedNodeName);
        nodes.forEach(function (item) {
          //Dragged node and its direct parent (if any) shouldn't be highlighted
          if (item.dataset.nodeName === element.dataset.nodeName
            || (directParent && directParent.name === item.dataset.nodeName)) {
            return;
          }
          item.classList.add('drop-target');
        });
        //Start tracking the mouse to identify the hover item
        //This is done because the mirror of the dragged node will have the highest z-order
        //thus no events regarding drag enter or mouse hover can be properly tracked
        var mouseMoveHandler = function (e) {
          var elements = Array.from(document.elementsFromPoint(e.clientX, e.clientY));
          //Take the current drop target (should be one or none)
          var previousDropTargets = Array.from(container.getElementsByClassName('active-drop-target'));
          var previousDropTarget = previousDropTargets.length === 0 ? null : previousDropTargets[0];
          //Find node under mouse other than the dragged one
          var newDropTargets = elements.filter(function (item) {
            return item.classList.contains('node') && item.classList.contains('drop-target');
          });
          var newDropTarget = newDropTargets.length === 0 ? null : newDropTargets[0];
          //Now if we have new drop target, it should get marked
          if (newDropTarget) {
            newDropTarget.classList.add('active-drop-target');
          }
          //If there was previous drop target and it is different from the new one, it should get unmarked
          if (previousDropTarget && (!newDropTarget || previousDropTarget.dataset.nodeName != newDropTarget.dataset.nodeName)) {
            previousDropTarget.classList.remove('active-drop-target');
          }
        };
        container.mouseMoveHandler = mouseMoveHandler;
        document.addEventListener('mousemove', mouseMoveHandler);
      });
      drake.on('drop', function (element, target, source, sibling) {
        var activeDropTargets = Array.from(container.getElementsByClassName('active-drop-target'));
        var activeDropTarget = activeDropTargets.length === 0 ? null : activeDropTargets[0];
        //It means that we dropped it somewhere outside of the node
        if (activeDropTarget === null) {
          return;
        }
        var newParentName = activeDropTarget.dataset.nodeName;
        var currentNodeName = element.dataset.nodeName;
        var originalNodeState = _strategy.getNode(strategy, currentNodeName);
        var actualNodeState = _utils.clone(originalNodeState);
        actualNodeState.parentNodeName = newParentName;
        //This is to allow dragula to clean up first, so we rebuild our diagram after it
        window.setTimeout($A.getCallback(function () {
          self.saveStrategy(component, originalNodeState, actualNodeState);
        }));
      });
      drake.on('dragend', function (element) {
        var nodes = Array.from(container.getElementsByClassName('node'));
        nodes.forEach(function (item) {
          item.classList.remove('drop-target');
          item.classList.remove('active-drop-target');
        });
        document.removeEventListener('mousemove', container.mouseMoveHandler);
        delete container.mouseMoveHandler;
      });
      container.drake = drake;
    } else {
      container.style.width = '0px';
      container.style.height = '0px';
    }
  },

  createNode: function (component, container, strategy, treeLayoutNode) {
    self = this;
    var visualNode = document.createElement('div');
    visualNode.dataset.nodeName = treeLayoutNode.strategyNode.name;
    var specificNodeClass = '';
    switch (treeLayoutNode.strategyNode.nodeType) {
      case _utils.NodeType.IF:
        specificNodeClass = 'if-node';
        break;
      case _utils.NodeType.UNION:
        specificNodeClass = 'union-node';
        break;
      case _utils.NodeType.SOQL_LOAD:
        specificNodeClass = 'soql-load-node';
        break;
      case _utils.NodeType.RECOMMENDATION_LIMIT:
        specificNodeClass = 'recommendation-limit-node';
        break;
      case _utils.NodeType.FILTER:
        specificNodeClass = 'filter-node';
        break;
    }
    visualNode.classList.add('node');
    if (specificNodeClass) {
      visualNode.classList.add(specificNodeClass);
    }
    visualNode.style.left = treeLayoutNode.x + 'px';
    visualNode.style.top = treeLayoutNode.y + 'px';
    // var text = document.createElement('p');
    // text.className = 'node-text';
    // text.innerText = treeLayoutNode.strategyNode.name;
    // visualNode.appendChild(text);
    container.appendChild(visualNode);
    visualNode.clickHandler = $A.getCallback(function () {
      self.showNodePropertiesDialog(strategy, treeLayoutNode.strategyNode);
    });
    visualNode.addEventListener('click', visualNode.clickHandler);
    return visualNode;
  }
})
