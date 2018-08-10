({
    delayedContextMenuInitialisation: function (cmp, pollingId) {
        var self = this;
        cmp.set("v._contextMenuInited", true);
        self.initContextMenu(cmp);
        window.clearInterval(pollingId);
    },

    initContextMenu: function (cmp) {
        var self = this;
        var host = document.getElementsByClassName('scroll-container')[0];
        if (host['connectionsViewContextMenuHandler']) {
            host.removeEventListener(host['connectionsViewContextMenuHandler']);
            delete host['connectionsViewContextMenuHandler'];
        }
        var contextMenuHandler = function (event) {
            var elements = Array.from(document.elementsFromPoint(event.clientX, event.clientY));
            var diagramRect = host.getBoundingClientRect();
            var currentNode = elements.find(function (item) { return item.classList.contains('node'); });
            //We clicked on a node - showing custom context menu
            if (currentNode) {
                event.preventDefault();
                var menuItems = Array.from(host.getElementsByClassName('connections-context-menu-item'));
                //We need to enable/disable menu items depending on the node
                //1. We can't delete root node
                //2. 
                menuItems.forEach(function (item) {
                    //We can't add child to external connection node
                    switch (item.dataset.action) {
                        // case 'add-child':
                        //     item.classList.toggle('enabled', currentNode.dataset.nodeType !== _utils.NodeType.EXTERNAL_CONNECTION);
                        //     break;
                        case 'delete':
                            item.classList.toggle('enabled', true);
                            break;
                    }
                });
                var contextMenu = self.showHideContextMenu({ top: event.clientY - diagramRect.y + host.scrollTop, left: event.clientX })
                contextMenu.dataset.nodeName = currentNode.dataset.node;
            }
            //Otherwise we clicked somewhere else - let browser handle this click
            else {
                self.showHideContextMenu();
            }
        };
        host.addEventListener('contextmenu', contextMenuHandler);
        host['connectionsViewContextMenuHandler'] = contextMenuHandler;

        if (window['diagramViewContextMenuconnectionsViewContextMenuHandlerItemClickHandler']) {
            window.removeEventListener(window['connectionsViewContextMenuHandler']);
            delete window['connectionsViewContextMenuHandler'];
        }

        var windowClick = function (event) {
            var contextMenu = self.getContextMenu();
            //This is done for the cases where strategy crafter no longer exists at the moment of click (ST-155)
            if (!contextMenu) {
                window.removeEventListener('click', window['connectionsViewContextMenuHandler']);
                delete window['connectionsViewContextMenuHandler'];
                return;
            }
            if (contextMenu._isDisplayed) {
                var elements = Array.from(document.elementsFromPoint(event.clientX, event.clientY));
                var menuItem = elements.find(function (item) { return item.classList.contains('connections-context-menu-item'); });
                //We clicked on one of the menu items
                if (menuItem) {
                    //If the menu item is not enabled, we ignore this click
                    if (!menuItem.classList.contains('enabled')) {
                        return;
                    }
                    var action = menuItem.dataset.action;
                    var nodeName = contextMenu.dataset.nodeName;
                    switch (action) {
                        // case 'add-child':
                        //     $A.getCallback(function () {
                        //         var addChildEvent = cmp.getEvent('childNodeCreationRequested');
                        //         addChildEvent.setParams({ 'parentNodeName': nodeName });
                        //         addChildEvent.fire();
                        //     })();
                        //     break;
                        case 'delete':
                            $A.getCallback(function () {
                                var deleteChildEvent = cmp.getEvent('nodeDeletionRequested');
                                deleteChildEvent.setParams({ 'node': _strategy.convertToNode(cmp.get('v.currentStrategy'), nodeName) });
                                deleteChildEvent.fire();
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
        window['connectionsViewContextMenuHandler'] = windowClick;
        windowClick(event);
    },

    getContextMenu: function () {
        return document.getElementsByClassName('connections-context-menu')[0];
    },

    showHideContextMenu: function (position) {
        var contextMenu = this.getContextMenu();
        if (position) {
            contextMenu.style.display = 'block';
            var host = document.getElementsByClassName('connectionsContainer')[0];
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
    }

})
