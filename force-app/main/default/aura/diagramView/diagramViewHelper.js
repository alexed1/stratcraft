({
    initialize: function (cmp) {
        if (cmp.get('v._isInitialized')) {
            this.initializeJsPlumb(cmp);
            this.initializeContextMenu(cmp);
        } else {
            cmp.set('v._isInitialized', true);
        }
    },

    getContextMenu: function () {
        return document.getElementsByClassName('context-menu')[0];
    },

    showHideContextMenu: function (position) {
        var contextMenu = this.getContextMenu();
        if (position) {
            contextMenu.style.display = 'block';
            var host = document.getElementsByClassName('diagram-scroll-view')[0];
            //Context menu will overflow to the right - move it to the left
            if (contextMenu.clientWidth + position.left - host.scrollLeft >= host.clientWidth) {
                contextMenu.style.left = (position.left - contextMenu.clientWidth) + 'px';
            } else {
                contextMenu.style.left = position.left + 'px';
            }
            //Context menu will overflow to the bottom - move it up
            if (contextMenu.clientHeight + position.top - host.scrollTop >= host.clientHeight) {
                contextMenu.style.top = (position.top - contextMenu.clientHeight) + 'px';
            } else {
                contextMenu.style.top = position.top + 'px';
            }
            contextMenu._isDisplayed = true;
        } else {
            contextMenu.style.display = 'none';
            delete contextMenu._isDisplayed;
            delete contextMenu.dataset.nodeName;
        }
        return contextMenu;
    },

    initializeContextMenu: function (cmp) {
        var self = this;
        var host = document.getElementsByClassName('diagram-scroll-view')[0];
        host.addEventListener('contextmenu', function (event) {
            var elements = Array.from(document.elementsFromPoint(event.clientX, event.clientY));
            var diagramRect = host.getBoundingClientRect();
            var currentNode = elements.find(function (item) { return item.classList.contains('node'); });
            //We clicked on a node - showing custom context menu
            if (currentNode) {
                event.preventDefault();
                var menuItems = Array.from(host.getElementsByClassName('context-menu-item'));
                //We need to enable/disable menu items depending on the node
                //1. We can't delete root node
                //2. 
                menuItems.forEach(function (item) {
                    //We can't add child to external connection node
                    switch (item.dataset.action) {
                        case 'add-child':
                            item.classList.toggle('enabled', currentNode.dataset.nodeType !== _utils.NodeType.EXTERNAL_CONNECTION);
                            break;
                        case 'delete':
                            item.classList.toggle('enabled', !currentNode.dataset.isRoot);
                            break;
                    }
                });
                var contextMenu = self.showHideContextMenu({ top: event.clientY - diagramRect.y + host.scrollTop, left: event.clientX - diagramRect.x + host.scrollLeft })
                contextMenu.dataset.nodeName = currentNode.dataset.nodeName;
            }
            //Otherwise we clicked somewhere else - let browser handle this click
            else {
                self.showHideContextMenu();
            }
        });
        var windowClick = function (event) {
            var contextMenu = self.getContextMenu();
            //This is done for the cases where strategy crafter no longer exists at the moment of click (ST-155)
            if (!contextMenu) {
                window.removeEventListener('click', windowClick);
                return;
            }
            if (contextMenu._isDisplayed) {
                var elements = Array.from(document.elementsFromPoint(event.clientX, event.clientY));
                var menuItem = elements.find(function (item) { return item.classList.contains('context-menu-item'); });
                //We clicked on one of the menu items
                if (menuItem) {
                    //If the menu item is not enabled, we ignore this click
                    if (!menuItem.classList.contains('enabled')) {
                        return;
                    }
                    var action = menuItem.dataset.action;
                    var nodeName = contextMenu.dataset.nodeName;
                    switch (action) {
                        case 'add-child':
                            $A.getCallback(function () {
                                var cmpEvent = cmp.getEvent('childNodeCreationRequested');
                                cmpEvent.setParams({ 'parentNodeName': nodeName });
                                cmpEvent.fire();
                            })();
                            break;
                        case 'delete':
                            $A.getCallback(function () {
                                var cmpEvent = cmp.getEvent('nodeDeletionRequested');
                                cmpEvent.setParams({ 'node': _strategy.convertToNode(cmp.get('v.currentStrategy'), nodeName) });
                                cmpEvent.fire();
                            })();
                            break;
                        default:
                            console.log('WARN: unknown action in node context menu - ' + action);
                            break;
                    }
                }
                self.showHideContextMenu();
            }
        };
        window.addEventListener('click', windowClick);
    },

    initializeJsPlumb: function (cmp) {
        var self = this;
        var container = document.getElementsByClassName('diagram-container')[0];
        jsPlumb.setContainer(container);
        window.setTimeout($A.getCallback(function () {
            self.rebuildStrategyDiagram(cmp, cmp.get('v.currentStrategy'));
        }));
    },
    /** Removes all the diagram elements from the diagram container */
    clearDiagram: function () {
        var container = document.getElementsByClassName('diagram-container')[0];
        jsPlumb.reset();
        if (container.drake) {
            container.drake.destroy();
            delete container.drake;
        }
        while (container.firstChild) {
            var firstChild = container.firstChild;
            firstChild.removeEventListener('click', firstChild.clickHandler);
            delete firstChild.clickHandler;
            container.removeChild(firstChild);
        }
    },
    /** Adds node name and description as a text */
    addLabelOverlay: function (endpoint, name, description, isSource) {
        endpoint.addOverlay([
            'Custom', {
                create: function (component) {
                    var nodeLabel = document.createElement('div');
                    nodeLabel.innerHTML =
                        '<div class="node-label-part node-label-tooltip"><p class="node-label-header">' + _utils.escapeHtml(name) + '</p></div>'
                        + '<div class="node-label-part node-label-tooltip"><p class="node-label-body">' + _utils.escapeHtml(description) + '</p>'
                        + '<span class="node-label-tooltiptext">' + _utils.escapeHtml(description) + '</span></div>';
                    return nodeLabel;
                },
                location: [isSource ? -1.5 : -0.5, 1],
                cssClass: 'node-label'
            }
        ]);
    },
    /** Clears the current diagram and rebuild a new one from the given strategy */
    rebuildStrategyDiagram: function (cmp, strategy) {
        var self = this;
        this.clearDiagram();
        var container = document.getElementsByClassName('diagram-container')[0];
        var containerScrollView = document.getElementsByClassName('diagram-scroll-view')[0];
        if (strategy) {
            var treeLayout = _jsplumbWalker.buildTreeLayout(strategy);
            //This is the adjustment step in order to put the whole tree in the middle of the container
            //(and adjust the size of the container if it is less than the width of the tree)
            container.style.width = treeLayout.width + 'px';
            container.style.height = treeLayout.height + 'px';
            var queue = [];
            queue.push({
                layoutNode: treeLayout.root,
                visualNode: self.createNode(cmp, container, strategy, treeLayout.root)
            });
            var rootVisualNode = queue[0].visualNode;
            jsPlumb.batch(function () {
                var parentIsRoot = true;
                while (queue.length > 0) {
                    var parentNodePair = queue.shift();
                    parentNodePair.layoutNode.children.forEach(function (item) {
                        var childNodePair = {
                            layoutNode: item,
                            visualNode: self.createNode(cmp, container, strategy, item)
                        };
                        var connection = jsPlumb.connect({
                            source: childNodePair.visualNode,
                            target: parentNodePair.visualNode,
                            anchors: ['Right', 'Left'],
                            endpoint: ['Rectangle', { width: 48, height: 48, cssClass: 'hidden-overlay' }],
                            connector: 'Flowchart',
                            paintStyle: { stroke: '#919297', strokeWidth: 2 },
                            overlays: [['Arrow', {
                                width: 8,
                                length: 8,
                                location: 1,
                                foldback: 1,
                                paintStyle: {
                                    stroke: '#919297',
                                    fill: '#919297'
                                }
                            }]]
                        });
                        queue.push(childNodePair);
                        //We add label overlay to the source (child) endpoint
                        //If we are processing a root node's childrent at the moment, we also add overlay to the target (parent) endpoint
                        var sourceEndpoint = connection.endpoints[0];
                        self.addLabelOverlay(sourceEndpoint, childNodePair.layoutNode.strategyNode.name, childNodePair.layoutNode.strategyNode.description, true);
                        if (parentIsRoot) {
                            var targetEndpoint = connection.endpoints[1];
                            self.addLabelOverlay(targetEndpoint, parentNodePair.layoutNode.strategyNode.name, parentNodePair.layoutNode.strategyNode.description, false);
                            parentIsRoot = false;
                        }
                    });
                }
                //This is for the case when there is only root node in the strategy
                if (parentIsRoot && (!treeLayout.root.strategyNode.children || treeLayout.root.strategyNode.children.length == 0)) {
                    var endpoint = jsPlumb.addEndpoint(rootVisualNode, {
                        anchor: 'Left',
                        isTarget: true,
                        endpoint: 'Blank'
                    });
                    self.addLabelOverlay(endpoint, treeLayout.root.strategyNode.name, treeLayout.root.strategyNode.description, false);
                }
            });
            var overlays = Array.from(container.getElementsByClassName('jtk-overlay'));
            //For some reason jsPlumb adds strange translate transform. The next line return the labels back to their origins
            overlays.forEach(function (item) {
                item.style.transform = 'none';
            });
            if (overlays.length === 1) {
                overlays[0].style.left = -48 + 'px';
                overlays[0].style.top = 48 + 'px';
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
                    //External Connection nodes also shouldn't be highlighted
                    if (item.dataset.nodeName === element.dataset.nodeName
                        || (directParent && directParent.name === item.dataset.nodeName)
                        || item.dataset.nodeType === _utils.NodeType.EXTERNAL_CONNECTION) {
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
                var oldNode = _strategy.getNode(strategy, currentNodeName);
                var newNode = _utils.clone(oldNode);
                newNode.parentNodeName = newParentName;
                //This is to allow dragula to clean up first, so we rebuild our diagram after it
                window.setTimeout($A.getCallback(function () {
                    self.raiseStrategyChangedEvent(cmp, strategy, oldNode, newNode);
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

    raiseStrategyChangedEvent: function (cmp, strategy, oldNode, newNode) {
        var event = cmp.getEvent('strategyChanged');
        event.setParams({
            'strategy': strategy,
            'oldNode': oldNode,
            'newNode': newNode
        });
        event.fire();
    },

    createNode: function (cmp, container, strategy, treeLayoutNode) {
        var self = this;
        var visualNode = document.createElement('div');
        visualNode.dataset.nodeName = treeLayoutNode.strategyNode.name;
        visualNode.dataset.nodeType = treeLayoutNode.strategyNode.nodeType;
        visualNode.dataset.isRoot = treeLayoutNode.strategyNode.parentNodeName ? '' : 'true';
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
            case _utils.NodeType.SORT:
                specificNodeClass = 'sort-node';
                break;
            case _utils.NodeType.EXTERNAL_CONNECTION:
                specificNodeClass = 'external-node';
                break;
            case _utils.NodeType.RECORD_JOIN:
                specificNodeClass = 'record-join-node';
                break;
            case _utils.NodeType.MUTUALLY_EXCLUSIVE:
                specificNodeClass = 'exclusive-node';
                break;
        }
        visualNode.classList.add('node');
        if (specificNodeClass) {
            visualNode.classList.add(specificNodeClass);
        }
        visualNode.style.left = treeLayoutNode.x + 'px';
        visualNode.style.top = treeLayoutNode.y + 'px';
        container.appendChild(visualNode);
        visualNode.clickHandler = $A.getCallback(function () {
            self.showNodePropertiesDialog(cmp, strategy, treeLayoutNode.strategyNode);
        });
        visualNode.addEventListener('click', visualNode.clickHandler);
        return visualNode;
    },

    showNodePropertiesDialog: function (cmp, strategy, strategyNode) {
        var self = this;
        _modalDialog.show(
            'Node Properties',
            [_utils.getComponentName('basePropertyPageX'), function (body) {
                body.set('v.currentStrategy', strategy);
                body.set('v.currentNode', strategyNode);
                body.addEventHandler('propertyPageSaveRequest', function (event) {
                    _modalDialog.close();
                    var currentStrategy = cmp.get('v.currentStrategy');
                    var newNode = event.getParam('newNodeState');
                    var oldNode = event.getParam('originalNodeState');
                    self.raiseStrategyChangedEvent(cmp, currentStrategy, oldNode, newNode);
                });

            }]);
    },
})
