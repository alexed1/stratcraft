({
    raiseStrategyChangedEvent: function (cmp, strategy, oldNode, newNode, confirmCallback) {
        var event = cmp.getEvent('strategyChanged');
        event.setParams({
            'strategy': strategy,
            'oldNode': oldNode,
            'newNode': newNode,
            'confirmCallback': confirmCallback
        });
        event.fire();
    },

    rebuildTree: function (cmp) {
        var strategy = cmp.get('v.currentStrategy');
        var propertyPage = cmp.find('propertyPage');
        var currentNode = propertyPage.get('v.currentNode');
        if (strategy) {
            cmp.set('v.tree', [this.buildTreeFromStrategy(strategy)])
        } else {
            cmp.set('v.tree', []);
        }
        if (!strategy || !currentNode || !strategy.nodes.some(function (item) { return item.name === currentNode.name; })) {
            propertyPage.set('v.currentNode', null);
        }
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

    handleTreeNodeSelect: function (cmp, newNodeName) {
        var currentStrategy = cmp.get('v.currentStrategy');
        var propertyPage = cmp.find('propertyPage');
        var newSelectedNode = newNodeName ? _strategy.getNode(currentStrategy, newNodeName) : null;
        var proceeedToSelect = function () {
            propertyPage.set('v.currentNode', newSelectedNode);
        };
        if (propertyPage.isDirty()) {
            //TODO: provide cancel callback that will switch the selected node back to the original (i.e. visually highlight it)
            this.showUnsavedChangesDialog(proceeedToSelect);
        }
        else {
            proceeedToSelect();
        }
    }
})
