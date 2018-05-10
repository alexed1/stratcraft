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
        //If node has no name it typically means that node doesn't exist yet, thus it won't have any descendants
        if (nodeName) {
          nodes = _strategy.getDirectChildrenNodes(strategy, nodeName);
        }
        break;
      default:
        throw new Error('Node relationship type ' + nodeRelationship + ' is not yet supported');
    }
    return nodes;
  },

  getActiveView: function (cmp) {
    var isTreeView = cmp.get('v.isTreeView') == 'true';
    return isTreeView ? cmp.find('treeView') : cmp.find('diagramView');
  },

  getInactiveView: function (cmp) {
    var isTreeView = cmp.get('v.isTreeView') == 'true';
    return isTreeView ? cmp.find('diagramView') : cmp.find('treeView');
  },

  handleStrategySelection: function (cmp) {
    var self = this;
    self.ensureEmptyStrategyIsRemoved(cmp);

    var currentStrategy = cmp.get('v.currentStrategy');
    var newStrategyName = cmp.get('v.selectedStrategyName');
    //If we try to select the same strategy that is already selected, we do nothing
    //This may happen e.g. if we are selecting a new strategy, but the current one has unsaved changes and user decided to cancel the selection
    if (currentStrategy && currentStrategy.name === newStrategyName) {
      return;
    }
    //Here we should check with active view whether we can change selected strategy
    //Diagram view will always allow to select new strategy while tree view allows it only if there are no unsaved changes or user choses to save them
    var activeView = this.getActiveView(cmp);
    var proceedCallback = function () {
      if (newStrategyName) {
        self.loadStrategy(cmp, newStrategyName);
      }
      else {
        cmp.set('v.currentStrategy', null);
      }
    };
    var cancelCallback = function () {
      cmp.set('v.selectedStrategyName', currentStrategy ? currentStrategy.name : null);
    }
    activeView.canSelectNewStrategy(proceedCallback, cancelCallback);
  },
  //Populates the select strategy drop down
  loadStrategyNames: function (cmp, onSuccess) {
    var cmpEvent = $A.get('e.c:mdLoadStrategyNamesRequest');
    cmpEvent.setParams({
      'callback': function (result) {
        console.log(result);
        if (result.value && !result.error) {
          var strategyNames = result.value;
          if (strategyNames) {
            strategyNames.splice(0, 0, '');
            cmp.set('v.strategyNames', strategyNames);
          }
          if (onSuccess)
            onSuccess();
        }
        else {
          _force.displayToast('Strategy Crafter', 'Failed to load strategy names ' + result.error, 'Error', true);
        }
        _cmpUi.spinnerOff(cmp, 'spinner');
      }
    });
    cmpEvent.fire();
  },
  //when a strategy is selected, loads data from its Salesforce record
  loadStrategy: function (cmp, strategyName) {
    _cmpUi.spinnerOn(cmp, 'spinner');
    var self = this;

    var cmpEvent = $A.get('e.c:mdGetStrategyRequest');
    cmpEvent.setParams({
      'strategyName': cmp.get('v.selectedStrategyName'),
      'callback': function (result) {
        _undoManager.clear();
        _cmpUi.spinnerOff(cmp, 'spinner');
        if (!result.error) {
          var strategy = result.value;
          cmp.set('v.currentStrategy', strategy);
          console.log('Retrieved strategy with name ' + strategy.name);
        }
        else {
          _force.displayToast('Strategy Crafter', 'Strategy changes save failed ' + result.error, 'Error', true);
        }
      }
    });
    cmpEvent.fire();
  },

  saveStrategy: function (cmp, oldNode, newNode, onSuccess) {
    //If both old and new nodes as empty, it means that this save is a result of undo/redo operation
    var isUndoRedo = !oldNode && !newNode;
    var self = this;
    console.log('in save strategy in parent controller');
    var strategy = cmp.get('v.currentStrategy');
    var validationResult = isUndoRedo ? null : this.validateNodeChange(strategy, oldNode, newNode);
    if (validationResult) {
      _force.displayToast('Error', validationResult, 'error');
      return;
    }
    //If this save is a result of undo/redo operation, then the changes are already applied
    if (!isUndoRedo) {
      this.applyChangesToStrategy(cmp, strategy, oldNode, newNode);
    }
    var activeView = this.getActiveView(cmp);
    activeView.refresh();
    console.log('Sending Strategy to Salesforce and persisting');
    //send strategy to metadataservice
    var curStrat = cmp.get('v.currentStrategy');
    var cmpEvent = $A.get('e.c:mdCreateOrUpdateStrategyRequest');
    cmpEvent.setParams({
      'strategy': curStrat,
      'isAsync': true,
      'callback': function (result) {
        if (!result.error) {
          if (onSuccess) {
            onSuccess();
          }
        }
        else {
          _force.displayToast('Strategy Crafter', 'Strategy changes save failed ' + result.error, 'Error', true);
          return;
        }
      }
    });
    cmpEvent.fire();
  },

  /**Validates if changes to the node are valid and can be applied to the strategy
   * @param {object} strategy - Current strategy
   * @param {object} originalNode - Original state of the node before change
   * @param {object} changedNode - Current state of the node after change
   */
  validateNodeChange: function (strategy, oldNode, newNode) {
    var self = this;
    //Node is being removed
    if (oldNode && !newNode) {
      if (!oldNode.parentNodeName) {
        return 'Can\'t delete a root node';
      }
      return null;
    }
    //Node is being added
    if (!oldNode && newNode) {
      var sameNameNodes = strategy.nodes.filter(function (item) {
        return item.name.trim().toLowerCase() == newNode.name.trim().toLowerCase();
      })
      if (sameNameNodes.length > 1) {
        return 'A node with the same name already exists';
      }
      return null;
    }
    if (newNode.name == newNode.parentNodeName) {
      return 'A node can\'t be a parent to itself';
    }
    if (oldNode.name != newNode.name) {
      var sameNameNodes = strategy.nodes.filter(function (item) {
        return item.name.trim().toLowerCase() == newNode.name.trim().toLowerCase();
      })
      if (sameNameNodes.length > 1) {
        return 'A node with the same name already exists';
      }
    }
    if (oldNode.parentNodeName != newNode.parentNodeName) {
      var wasRoot = !oldNode.parentNodeName;
      var isRoot = !newNode.parentNodeName;
      if (!wasRoot && isRoot) {
        return 'A strategy can\'t have two root nodes';
      }
      //This is for the case where we move root node to one of its children. This leads to its direct children to lose the root as a parent
      //and becoming roots themselves but we don't allow more than one root
      if (wasRoot && _strategy.getDirectChildrenNodes(strategy, oldNode).length > 1) {
        return 'A strategy can\'t have more than one root';
      }
    }
    return null;
  },

  /**Compares original and actual node states, updates this node in strategy and trigger the tree rebuilding
   * @param {object} cmp - A reference to stratcraft component
   * @param {object} originalNode - Original state of the node before change
   * @param {object} changedNode - Current state of the node after change
   */
  applyChangesToStrategy: function (cmp, strategy, oldNode, newNode) {
    //It means that we are removing node
    if (!newNode) {
      _undoManager.removeNode(strategy, oldNode);
      return;
    }
    //It means that we are adding node
    if (!oldNode) {
      _undoManager.addNode(strategy, newNode);
      return;
    }
    _undoManager.changeNode(strategy, oldNode, newNode);
  },

  deleteNodeAndSaveStrategy: function (strategy, node, cmp) {
    var self = this;
    self.saveStrategy(cmp, node, null, function () {
      var activeView = self.getActiveView(cmp);
      if (activeView.selectNode) {
        activeView.selectNode(null);
      }
    });
  },

  showNewNodeDialog: function (cmp, strategy, strategyNode, allowParentSelection) {
    var self = this;
    _modalDialog.show(
      'New Node Properties',
      ['c:basePropertyPage', function (body) {
        body.set('v.currentStrategy', strategy);
        body.set('v.currentNode', strategyNode);
        body.set('v.showParent', allowParentSelection);
        body.set('v.showNodeActions', strategyNode.nodeName ? true : false);
        body.addEventHandler('propertyPageSaveRequest', function (event) {
          _modalDialog.close();
          var newNode = event.getParam('newNodeState');
          //We don't provide the old node because we intend to save the current one as a new
          self.saveStrategy(cmp, null, newNode, function () {
            var activeView = self.getActiveView(cmp);
            if (activeView.selectNode) {
              activeView.selectNode(newNode);
            }
          });
        });
      }]);
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
        newStrategy.name = body.get("v.strategyName").trim();
        newStrategy.description = body.get("v.strategyDescription");
        newStrategy.masterLabel = body.get("v.strategyMasterLabel");
        newStrategy.nodes = [{ "removeDuplicates": true, "description": "The root", "name": "WinningPropositions", "nodeType": "union", "parentNodeName": "" }];

        var cmpEvent = $A.get("e.c:mdCreateOrUpdateStrategyRequest");
        cmpEvent.setParams({
          "strategy": newStrategy,
          "callback": function (result) {
            _cmpUi.spinnerOff(cmp, "spinner");
            if (!result.value || result.error) {
              _force.displayToast('Strategy Crafter', 'Strategy creation failed ' + result.error, 'Error', true);
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
      },
      function (body) {
        return body.validate();
      }, null, 'narrowpopoverclass');
  },

  exportStrategyXML: function (cmp) {
    var cmpEvent = $A.get('e.c:mdConvertToXmlRequest');
    var currentStrategy = cmp.get('v.currentStrategy');
    cmpEvent.setParams({
      'strategyJson': JSON.stringify(currentStrategy),
      'callback': function (isSuccess, text) {
        if (isSuccess) {
          var element = document.createElement('a');
          element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(text));
          element.setAttribute('download', currentStrategy.name + '.xml');
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        } else {
          _force.displayToast('Strategy Crafter', 'Strategy export failed ' + text, 'Error', true);
        }
      }
    });
    cmpEvent.fire();
  },

  showImportXMLDialog: function (cmp) {
    var self = this;
    _modalDialog.show(
      'Importing Strategy XML',
      ['c:modalWindowImportStrategyXMLBody', function (body) {
        var validateCallback = function (text) {
          var result = true;
          if ((text || '').trim().match(/^\s*$/)) {
            result = false;
            body.set('v.errorMessage', 'XML can\'t be empty or contain only whitespaces');
          }
          var xmlValidationError = _utils.validateXML(text);
          if (xmlValidationError) {
            result = false;
            body.set('v.errorMessage', xmlValidationError);
          }
          return result;
        };
        body.set('v.validateCallback', validateCallback);
      }],
      //on "Ok" clicked
      function (bodyComponent) {
        {
          var xml = bodyComponent.get("v.input");
          _cmpUi.spinnerOn(cmp, "spinner");
          var cmpEvent = $A.get("e.c:mdCreateOrUpdateStrategyRequest");
          cmpEvent.setParams({
            "strategyXML": xml,
            "callback": function (result) {
              if (!result.value || result.error) {
                _cmpUi.spinnerOff(cmp, "spinner");
                _force.displayToast('Strategy Crafter', 'Strategy import failed ' + result.error, 'Error', true);
                return;
              }
              else {
                _force.displayToast('Strategy Crafter', 'Strategy imported');
                cmp.set("v.selectedStrategyName", result.value.name);
                if (!cmp.get("v.currentStrategy"))
                  cmp.set("v.currentStrategy", result.value);
                self.loadStrategyNames(cmp);
              }
            }
          });
          cmpEvent.fire();
        };
      },
      function (bodyComponent) {
        return bodyComponent.validate();
      });
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
            if (response.error) {
              _cmpUi.spinnerOff(cmp, "spinner");
              _force.displayToast('Strategy Crafter', 'Failed to delete a strategy ' + response.error, 'Error', true);
              return;
            }
            else {
              _force.displayToast('Strategy Crafter', 'Strategy was deleted');
              self.loadStrategyNames(cmp, function onSuccess() {
                //there seems to be race condition and listing strategies might still return a deleted one,
                // so we make sure that we exclude it
                var strategyNames = cmp.get("v.strategyNames");
                var deletedStrategyIndex = strategyNames.indexOf(strategyName);
                strategyNames.splice(deletedStrategyIndex, 1);
                if (strategyNames.indexOf('') == -1)
                  strategyNames.splice(0, 0, '');
                cmp.set("v.strategyNames", strategyNames);
                cmp.set("v.selectedStrategyName", '');
              });
            }
          }
        });
        cmpEvent.fire();
      });
  },

  copyStrategy: function (cmp) {
    var self = this;
    var strategy = cmp.get("v.currentStrategy");
    var newStrategyName = strategy.name + 'Copy';
    self.showCopyStrategyDialog(cmp, function (body) {
      var newName = body.get("v.input");
      _cmpUi.spinnerOn(cmp, "spinner");

      var cmpEvent = $A.get("e.c:mdCopyStrategyRequest");
      cmpEvent.setParams({
        "strategy": strategy,
        "newStrategyName": newName,
        "callback": function (result) {
          if (!result.error) {
            _force.displayToast('Strategy Crafter', 'Strategy copied');
            self.loadStrategyNames(cmp);
          }
          else {
            _cmpUi.spinnerOff(cmp, "spinner");
            _force.displayToast('Strategy Crafter', 'Strategy copying failed ' + result.error, 'Error', true);
          }
        }
      });

      cmpEvent.fire();
    }, newStrategyName);
  },

  showCopyStrategyDialog: function (cmp, okCallback, newName) {
    var self = this;
    _modalDialog.show(
      'Copying strategy',
      ['c:modalWindowInputBody', function (body) {
        body.set('v.text', 'What would the name of the copy be?');
        body.set('v.input', newName);
        body.set('v.iconName', _force.Icons.Action.Question);
      }],
      okCallback);
  },

  showRenameStrategyDialog: function (cmp, okCallback) {
    var self = this;
    var strategy = cmp.get("v.currentStrategy");
    var strategyName = cmp.get("v.selectedStrategyName");
    _modalDialog.show(
      'Renaming strategy',
      ['c:modalWindowInputBody', function (body) {
        body.set("v.input", strategyName);
        body.set('v.text', 'What would the new name of the "' + strategyName + '" strategy be?');
        body.set('v.iconName', _force.Icons.Action.Question);
      }],
      function (body) {
        var newName = body.get("v.input");
        _cmpUi.spinnerOn(cmp, "spinner");
        var cmpEvent = $A.get("e.c:mdRenameStrategyRequest");
        cmpEvent.setParams({
          "strategy": strategy,
          "newStrategyName": newName,
          "callback": function (response) {
            if (!response.error) {
              _force.displayToast('Strategy Crafter', 'Strategy renamed');
              cmp.set("v.selectedStrategyName", newName);
              self.loadStrategyNames(cmp);
            }
            else {
              _force.displayToast('Strategy Crafter', 'Strategy renaming failed ' + response.error, 'Error', true);
              _cmpUi.spinnerOff(cmp, "spinner");
            }
          }
        });

        cmpEvent.fire();
      });
  },

  toggleView: function (cmp) {
    var self = this;
    //ar activeView = helper.getActiveView(cmp);
    var treeContainer = cmp.find('treeView').find('treeContainer');
    var diagramContainer = cmp.find('diagramView').find('diagramView');
    $A.util.toggleClass(diagramContainer, 'slds-hide');
    $A.util.toggleClass(treeContainer, 'slds-hide');
    var isTreeView = cmp.get('v.isTreeView') == 'true';
    if (!isTreeView) {
      var activeView = self.getActiveView(cmp);
      window.setTimeout($A.getCallback(function () { activeView.refresh(); }));
    }
  },

  /**Makes sure that an empty option in the strategy selection list is removed
   * @param {object} cmp - a reference to a stratcraft component
   */
  ensureEmptyStrategyIsRemoved: function (cmp) {
    var strategyNames = cmp.get('v.strategyNames');
    if (strategyNames && strategyNames.length > 0 && strategyNames[0] === '') {
      strategyNames = strategyNames.slice(1);
      cmp.set('v.strategyNames', strategyNames);
    }
  }
})