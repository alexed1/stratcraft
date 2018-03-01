/** Contains functions related to strategy traversing */
window._strategy = (function () {
    return {
        /**Returns node if node is passed or looks for the node in the strategy if name is passed
         * @param {object} strategy - Strategy object
         * @param {object/string} node - Node object that belongs to the strategy or node name
         */
        convertToNode: function (strategy, node) {
            if (!strategy) {
                throw new Error('Strategy can\'t be empty');
            }
            if (!node) {
                throw new Error('Node or node name is not specified');
            }
            if (typeof node === 'string') {
                node = this.getNode(strategy, node);
            }
            return node;
        },
        /**Removes node and all its children from the strategy returning true, if node was removed and false otherwise
         * @param {object} strategy - Strategy object
         * @param {object/string} node - Node object that belongs to the strategy or node name
         */
        deleteNode: function (strategy, node) {
            var self = this;
            node = this.convertToNode(strategy, node);
            if (!node) {
                return false;
            }
            var index = strategy.nodes.findIndex(function (item) {
                return item.name == node.name;
            });
            if (index == -1) {
                return false;
            }
            var children = this.getDirectChildrenNodes(strategy, node);
            strategy.nodes.splice(index, 1);
            children.forEach(function (item) {
                self.deleteNode(strategy, item);
            })
            return true;
        },
        /**Returns all direct children nodes of the specified node. Returns empty array if specified node is a leaf node 
         * @param {object} strategy - Strategy object
         * @param {object/string} node - Node object that belongs to the strategy or node name
         */
        getDirectChildrenNodes: function (strategy, node) {
            node = this.convertToNode(strategy, node);
            if (!node) {
                return [];
            }
            var children = strategy.nodes.filter(function (item) { return item.parentNodeName == node.name; });
            return children;
        },
        /**Returns a node with the specified name for the given strategy
         * @param {object} strategy - Strategy object
         * @param {string} nodeName - Name of the node to search for
         */
        getNode: function (strategy, nodeName) {
            if (!strategy) {
                throw new Error('Strategy can\'t be empty');
            }
            if (!nodeName) {
                throw new Error('Node name can\'t be empty');
            }
            var nodeFound = strategy.nodes.filter(function (item) { return item.name == nodeName; });
            if (nodeFound.length == 0) {
                return null;
            }
            if (nodeFound.length > 1) {
                throw new Error('Strategy contains more than one node with name \'' + nodeName + '\'');
            }
            return nodeFound[0];
        },
        /**Returns a parent node for the specified node. Returns null if specified node is a root node 
         * @param {object} strategy - Strategy object
         * @param {object/string} node - Node object that belongs to the strategy or node name
        */
        getParentNode: function (strategy, node) {
            node = this.convertToNode(strategy, node);
            if (!node) {
                return null;
            }
            var parentNode = strategy.nodes.filter(function (item) { return item.name == node.parentNodeName; });
            if (parentNode.length == 0) {
                return null;
            }
            if (parentNode.length > 1) {
                throw new Error('Strategy contains more than one node with the name \'' + node.parentNodeName + '\'');
            }
            return parentNode[0];
        },
        /**Returns a root node for the given strategy
         * @param {object} strategy - Strategy object
         */
        getRootNode: function (strategy) {
            if (!strategy) {
                throw new Error('Strategy can\'t be empty');
            }
            var rootNode = strategy.nodes.filter(function (item) { return !item.parentNodeName; });
            if (rootNode.length == 0) {
                throw new Error('Strategy doesn\'t contain a root node');
            }
            if (rootNode.length > 1) {
                throw new Error('Strategy contains more than one root node');
            }
            return rootNode[0];
        },
        /**Returns true if node has children nodes, otherwise false
         * @param {object} strategy - Strategy object
         * @param {object/string} node - Node object that belongs to the strategy or node name
         */
        hasChildrenNodes: function (strategy, node) {
            node = this.convertToNode(strategy, node);
            if (!node) {
                return false;
            }
            return strategy.nodes.some(function (item) { return item.parentNodeName == node.name });
        },
        /**Returns true if 'expectedParent' is direct or indirect parent to 'expectedChild' node
         * @param {object} strategy - Strategy object
         * @param {object/string} expectedParent - Node object that belongs to the strategy or node name
         * @param {object/string} expectedChild - Node object that belongs to the strategy or node name
         */
        isParentOf: function (strategy, expectedParent, expectedChild) {
            var expectedParent = this.convertToNode(strategy, expectedParent);
            var expectedChild = this.convertToNode(strategy, expectedChild);
            if (!expectedChild.parentNodeName) {
                return false;
            }
            if (expectedChild.parentNodeName == expectedParent.name) {
                return true;
            }
            return this.isParentOf(strategy, expectedParent, expectedChild.parentNodeName);
        }
    }
})()