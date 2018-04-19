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

  handleStrategySelection: function (component) {
    var self = this;
    self.ensureEmptyStrategyIsRemoved(component);

    var currentStrategy = component.get('v.currentStrategy');
    var newStrategyName = component.get('v.selectedStrategyName');
    //If we try to select the same strategy that is already selected, we do nothing
    //This may happen e.g. if we are selecting a new strategy, but the current one has unsaved changes and user decided to cancel the selection
    if (currentStrategy && currentStrategy.name === newStrategyName) {
      return;
    }
    if (newStrategyName) {
      self.loadStrategy(component, newStrategyName);
    }
    else {
      component.set('v.currentStrategy', null);
    }
    //TODO: move it to tree view
    //Since we are selecting a different strategy, we need to clear the property page
    // var propertyPage = component.find('propertyPage');
    // var proceedToSelect = function () {
    //   propertyPage.clear();
    //   if (newStrategyName) {
    //     self.loadStrategy(component, newStrategyName);
    //   }
    //   else {
    //     component.set('v.currentStrategy', null);
    //   }
    // };
    // var reverseSelection = function () {
    //   component.set('v.selectedStrategyName', currentStrategy.name);
    // };
    // if (propertyPage.isDirty()) {
    //   self.showUnsavedChangesDialog(proceedToSelect, reverseSelection);
    // }
    // else {
    //   proceedToSelect();
    // }
  },

  //Populates the select strategy drop down
  loadStrategyNames: function (component) {
    var cmpEvent = $A.get("e.c:mdLoadStrategyNamesRequest");
    cmpEvent.setParams({
      "callback": function (strategyNames) {
        console.log(strategyNames);
        if (strategyNames) {
          strategyNames.splice(0, 0, '');
          component.set("v.strategyNames", strategyNames);
        }
        _cmpUi.spinnerOff(component, "spinner");
      }
    });

    cmpEvent.fire();
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
    _cmpUi.spinnerOn(component, "spinner");
    var self = this;

    var cmpEvent = $A.get("e.c:mdGetStrategyRequest");
    cmpEvent.setParams({
      "strategyName": component.get("v.selectedStrategyName"),
      "callback": function (strategyXML) {

        var action = component.get('c.strategyXMLToObject');
        action.setParams({ xml: strategyXML });
        action.setCallback(this, function (response) {
          var state = response.getState();
          if (state === 'SUCCESS') {
            var strategy = response.getReturnValue();
            component.set('v.currentStrategy', strategy);
            //TODO: move to tree view partially and remove everything not needed
            // component.find('tree').set('v.treeItems', [self.buildTreeFromStrategy(strategy)]);
            // var isTreeView = component.get('v.isTreeView');
            // if (isTreeView) {
            //   self.clearDiagram();
            // }
            // else {
            //   self.rebuildStrategyDiagram(component, strategy);
            // }
            console.log('Retrieved strategy with Id ' + strategy.Id);
          }
          else {
            console.log('Failed to retrieve strategy with state: ' + state);
          }

          _cmpUi.spinnerOff(component, "spinner");
        });
        $A.enqueueAction(action);

      }
    });
    cmpEvent.fire();
  },

  saveStrategy: function (component, originalNodeState, actualNodeState, onSuccess) {
    _cmpUi.spinnerOn(component, "spinner");
    var self = this;
    console.log('in save strategy in parent controller');
    var strategy = component.get('v.currentStrategy');
    //This scenario describes changes to the strategy that came from altering the node properties    
    if (originalNodeState && actualNodeState) {
      var validationResult = this.validateNodeChange(strategy, originalNodeState, actualNodeState);
      if (validationResult) {
        _cmpUi.spinnerOff(component, "spinner");
        _force.displayToast('Error', validationResult, 'error');
        return;
      }
      this.applyChangesToStrategy(component, strategy, originalNodeState, actualNodeState);
      //Temp solution
      var diagramView = component.find('diagramView');
      if (diagramView) {
        diagramView.forceRefresh();
      }
    }
    //Another possible scenario is when strategy structure is changed (e.g. node is added or removed) but in this case there is nothing to validate
    //TODO: check that the node it sill selected
    //Fire this event so the property page knows to reset itself
    //TODO: move to tree view
    //component.find('propertyPage').reset();
    //var newTree = self.buildTreeFromStrategy(strategy);
    //component.find('tree').set('v.treeItems', [newTree]);
    //If we currently see a diagram, we need to rebuild it
    // var isTreeView = component.get('v.isTreeView');
    // if (!isTreeView) {
    //   self.rebuildStrategyDiagram(component, component.get('v.currentStrategy'));
    // }


    //post the current strategy to the server
    //save it by name overwriting as necessary
    //return a status message
    self.persistStrategy(component, function () {
      //TODO: move to the tree view
      //This is to close modal dialog with base property page if a save was triggered from it
      // _modalDialog.close();
      // //If we currently see a diagram, we need to rebuild it
      // var isTreeView = component.get('v.isTreeView');
      // if (!isTreeView) {
      //   self.rebuildStrategyDiagram(component, component.get('v.currentStrategy'));
      // }
      if (onSuccess) {
        onSuccess();
      }

      _cmpUi.spinnerOff(component, "spinner");
    });
  },

  //save the strategy 
  persistStrategy: function (component, onSuccess) {

    console.log('requesting strategy XML')
    //request xml from controller
    var action = component.get('c.strategyJSONtoXML');

    //the nodes have to be resorted to meet the requirements of the salesforce mdapi processor
    //TODO: inefficient to do this every time this method is called.
    var curStrat = component.get('v.currentStrategy');
    var unsortedNodes = curStrat.nodes;
    var sortAlgo = function (x, y) {
      return ((x.nodeType == y.nodeType) ? 0 : ((x.nodeType > y.nodeType) ? 1 : -1));
    }
    var sortedNodes = unsortedNodes.sort(sortAlgo);
    curStrat.nodes = sortedNodes;
    var json = JSON.stringify(curStrat);

    //need to resort the nodes of this json, or maybe earlier, in order to avoid blowing up mdapi
    console.log('transmitting this json for conversion to XML: ' + json);
    action.setParams({ strategyJson: json });
    action.setCallback(this, function (response) {
      var state = response.getState();
      if (component.isValid() && state === 'SUCCESS') {
        var result = response.getReturnValue();
        console.log('Sending Strategy to Salesforce and persisting');
        //send xml to metadataservice
        var cmpEvent = $A.get("e.c:mdCreateOrUpdateStrategyRequest");
        console.log('transmitting this xml for metadata persistence: ' + result);
        cmpEvent.setParams({
          "strategyXML": result,
          "callback": function (persistedStrategyXML) {
            if (!persistedStrategyXML || persistedStrategyXML == '') {
              _force.displayToast('Strategy Crafter', 'Strategy changes save failed', 'Error');
              _cmpUi.spinnerOff(component, "spinner");
              return;
            }

            _force.displayToast('Strategy Crafter', 'Strategy changes saved');
            console.log(' returned from MetadataService: ' + result);
            console.log('persistedStrategyXML: ' + persistedStrategyXML);
            var action = component.get('c.strategyXMLToObject');
            action.setParams({ xml: persistedStrategyXML });
            action.setCallback(this, function (response) {
              //converting xml that was retrieved back into strategy
              if (component.isValid() && state === 'SUCCESS') {

                var result = response.getReturnValue();
                console.log('result from sending persistedStrategyXML to strategyXMLToObject. this will be the new strategy: ' + result);
                component.set('v.currentStrategy', result);
                if (onSuccess) {
                  onSuccess();
                }
              }
            });
            $A.enqueueAction(action);

          }
        });
        cmpEvent.fire();
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
  applyChangesToStrategy: function (component, strategy, originalNode, changedNode) {
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

  showDeleteNodeDialog: function (strategy, node, component) {
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
        //This is to close 'delete' dialog
        _modalDialog.close();
        //This is to close 'property page' dialog
        _modalDialog.close();
        _strategy.deleteNode(strategy, node);
        self.saveStrategy(component, null, null, function () {
          component.find('propertyPage').set('v.currentNode', null);
        });
      }
    );
  },

  showNewStrategyDialog: function (cmp) {
    var self = this;
    _modalDialog.show(
      'Creating a Strategy',
      ['c:modalWindowNewStrategy'],
      function (body) {
        //construct an object and send it to be converted to xml
        _cmpUi.spinnerOn(cmp, "spinner");
        var newStrategy = {};
        newStrategy.name = body.get("v.strategyName");
        newStrategy.description = body.get("v.strategyDescription");
        newStrategy.masterLabel = body.get("v.strategyMasterLabel");
        newStrategy.nodes = [{ "removeDuplicates": true, "description": "the root", "name": "RootNode", "nodeType": "union", "parentNodeName": "" }];
        var action = cmp.get('c.strategyJSONtoXML');
        action.setParams({ strategyJson: JSON.stringify(newStrategy) });
        action.setCallback(this, function (response) {
          if (response.getState() === 'SUCCESS') {
            var xml = response.getReturnValue();
            var cmpEvent = $A.get("e.c:mdCreateOrUpdateStrategyRequest");
            cmpEvent.setParams({
              "strategyXML": xml,
              "callback": function (persistedStrategyXML) {
                _cmpUi.spinnerOff(cmp, "spinner");
                if (!persistedStrategyXML || persistedStrategyXML == '') {
                  _force.displayToast('Strategy Crafter', 'Strategy creation failed', 'Error');
                  return;
                }
                else {
                  _force.displayToast('Strategy Crafter', 'Strategy created');
                  self.loadStrategyNames(cmp);
                  cmp.set("v.selectedStrategyName", newStrategy.name);
                }
              }
            });
            cmpEvent.fire();
          }
          else {
            _force.displayToast('Strategy Crafter', 'Strategy creation failed', 'Error');
            _cmpUi.spinnerOff(cmp, "spinner");
          }
        });

        $A.enqueueAction(action);
      }, null, null, 'narrowpopoverclass');
  },

  showImportXMLDialog: function (cmp) {
    var self = this;
    _modalDialog.show(
      'Importing Strategy XML',
      'c:modalWindowImportStrategyXMLBody',
      //on "Ok" clicked
      function (bodyComponent) {
        {
          var xml = bodyComponent.get("v.input");
          _cmpUi.spinnerOn(cmp, "spinner");
          var cmpEvent = $A.get("e.c:mdCreateOrUpdateStrategyRequest");
          cmpEvent.setParams({
            "strategyXML": xml,
            "callback": function (persistedStrategyXML) {
              _cmpUi.spinnerOff(cmp, "spinner");
              if (!persistedStrategyXML || persistedStrategyXML == '') {
                _force.displayToast('Strategy Crafter', 'Strategy import failed', 'Error');
                return;
              }
              else {
                _force.displayToast('Strategy Crafter', 'Strategy imported');
                self.loadStrategyNames(cmp);
              }
            }
          });
          cmpEvent.fire();

        };
      });
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

  showDeleteStrategyDialog: function (cmp) {
    var self = this;
    var strategyName = cmp.get("v.selectedStrategyName");
    _modalDialog.show(
      'Deleting Strategy',
      ['c:modalWindowGenericBody', function (body) {
        body.set('v.text', 'Are you sure you want to delete the strategy named "' + strategyName + '"?');
        body.set('v.iconName', _force.Icons.Action.Delete);
      }],
      //ok was clicked
      function () {
        _cmpUi.spinnerOn(cmp, "spinner");
        var cmpEvent = $A.get("e.c:mdDeleteStrategyRequest");
        cmpEvent.setParams({
          "strategyName": strategyName,
          "callback": function (response) {
            if (!response || response == '') {
              _cmpUi.spinnerOff(cmp, "spinner");
              _force.displayToast('Strategy Crafter', 'Failed to delete a strategy', 'Error');
              return;
            }
            else {
              _force.displayToast('Strategy Crafter', 'Strategy was deleted');
              self.loadStrategyNames(cmp);
            }
          }
        });
        cmpEvent.fire();
      });
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

  copyStrategy: function (cmp) {
    var self = this;
    self.showCopyStrategyDialog(cmp, function (body) {
      var newName = body.get("v.input");
      _cmpUi.spinnerOn(cmp, "spinner");
      self.strategyObjectToXML(cmp, function (strategyXml) {
        var cmpEvent = $A.get("e.c:mdCopyStrategyRequest");
        cmpEvent.setParams({
          "strategyXML": strategyXml,
          "newStrategyName": newName,
          "callback": function () {
            _force.displayToast('Strategy Crafter', 'Strategy copied');
            self.loadStrategyNames(cmp);
          }
        });

        cmpEvent.fire();
      });
    });
  },

  showCopyStrategyDialog: function (component, okCallback) {
    var self = this;
    _modalDialog.show(
      'Copying strategy',
      ['c:modalWindowInputBody', function (body) {
        body.set('v.text', 'What would the name of the copy be?');
        body.set('v.iconName', _force.Icons.Action.Question);
      }],
      okCallback);
  },

  showRenameStrategyDialog: function (cmp, okCallback) {
    var self = this;
    var strategyName = cmp.get("v.selectedStrategyName");
    _modalDialog.show(
      'Renaming strategy',
      ['c:modalWindowInputBody', function (body) {
        body.set('v.text', 'What would the new name of the "' + strategyName + '" strategy be?');
        body.set('v.iconName', _force.Icons.Action.Question);
      }],
      function (body) {
        var newName = body.get("v.input");
        _cmpUi.spinnerOn(cmp, "spinner");
        self.strategyObjectToXML(cmp, function (strategyXml) {
          var cmpEvent = $A.get("e.c:mdRenameStrategyRequest");
          cmpEvent.setParams({
            "strategyXML": strategyXml,
            "newStrategyName": newName,
            "callback": function (response) {
              if (response && response != '') {
                _force.displayToast('Strategy Crafter', 'Strategy renamed');
                cmp.set("v.selectedStrategyName", newName);
                self.loadStrategyNames(cmp);
              }
              else {
                _force.displayToast('Strategy Crafter', 'Strategy renaming failed', 'Error');
                _cmpUi.spinnerOff(cmp, "spinner");
              }
            }
          });

          cmpEvent.fire();
        });
      });
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

  strategyObjectToXML: function (cmp, callback) {
    var action = cmp.get('c.strategyJSONtoXML');
    action.setParams({ strategyJson: JSON.stringify(cmp.get('v.currentStrategy')) });
    action.setCallback(this, function (response) {
      var state = response.getState();
      callback(response.getReturnValue());
    });
    $A.enqueueAction(action);
  }
})