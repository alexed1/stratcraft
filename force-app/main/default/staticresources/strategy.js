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

            //updating parent IF branch
            var parentNode = this.getParentNode(strategy, node);
            if (parentNode && parentNode.nodeType == _utils.NodeType.IF) {
                if (parentNode.branches) {
                    var branchIndex = parentNode.branches.findIndex(function (x) { return x.child == node.name; });
                    if (branchIndex >= 0)
                        parentNode.branches.splice(branchIndex, 1);
                }
            }

            var children = this.getDirectChildrenNodes(strategy, node);
            strategy.nodes.splice(index, 1);
            children.forEach(function (item) {
                self.deleteNode(strategy, item);
            })

            return true;
        },
        /** Returns all direct and indirect children nodes of the specified nodes. Returns empty array if specified node is a leaf node.
         * Nodes are returned in BFS order
         * @param {object} strategy - Strategy object
         * @param {object/string} node - Node object that belongs to the strategy or node name
         */
        getAllChildrenNodes: function (strategy, node) {
            node = this.convertToNode(strategy, node);
            var result = [];
            if (!node) {
                return result;
            }
            var queue = [];
            queue.push(node);
            while (queue.length > 0) {
                var parent = queue.pop();
                var directChildren = this.getDirectChildrenNodes(strategy, parent);
                directChildren.forEach(function (item) {
                    queue.push(item);
                    result.push(item);
                });
            }
            return result;
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
            var nodeFound = strategy.nodes.find(function (item) { return item.name == nodeName; })
                || strategy.externalConnections.find(function (item) { return item.name == nodeName; });
            return nodeFound;
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
            console.log("strategy.nodes is: " + strategy.nodes);
            var rootNode = strategy.nodes.filter(function (item) { return !item.parentNodeName && item.nodeType != _utils.NodeType.EXTERNAL_CONNECTION; });
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
        },

        isNameValid: function (name) {
            name = (name || '').trim();
            if (!name) {
                return false;
            }
            //Name can only contain underscores and alphanumeric characters, begin with a letter, not include spaces, not end with an underscore
            if (!name.match(/^[a-z]{1}[a-z,0-9,_]*[^_]$/i)) {
                return false;
            }
            //...and not contain two consecutive underscored
            if (name.match(/_{2,}/)) {
                return false;
            }
            return true;
        }
    }
})()