window._jsplumbWalker = (function () {
    var Node = function _Class_Of_Node_(_strategyNode) {
        // Holds parent node.
        this.parent = null;
        // Holds left sibling node.
        this.leftSibling = null;
        // Holds right sibling node.
        this.rightSibling = null;
        // Holds left neighbor node.
        this.leftNeighbor = null;
        // Holds child nodes.
        this.children = [];
        // Holds related strategy node
        this.strategyNode = _strategyNode ? _strategyNode : null;
        // Holds x coordinate.
        this.x = 0;
        // Holds y coordinate.
        this.y = 0;
        // Holds preliminary coordinate.
        this.preliminary = 0;
        // Holds modifier coordinate.
        this.modifier = 0;
        // Holds level.
        this.level = 0;
    };
    /** Returns the next node in preporder. */
    Node.prototype.nextInPreorder = function nextInPreorder() {
        if (!this.children || this.children.length === 0) {
            var node = this;
            while (node.parent && !node.rightSibling) {
                node = this.parent
            }
            if (node.rightSibling) {
                return node.rightSibling;
            } else {
                return null;
            }
        } else {
            return this.children[0];
        }
    };
    /** Returns the previous node in preporder. */
    Node.prototype.prevInPreorder = function prevInPreorder() {
        if (this.leftSibling) {
            var node = this.leftSibling;
            while (node.children && node.children.length >= 1) {
                node = node.children[node.children.length - 1];
            }
            return node;
        } else {
            if (this.parent) {
                return this.parent;
            } else {
                return null;
            }
        }
    };
    /** Returns the next node in postorder. */
    Node.prototype.nextInPostorder = function nextInPostorder() {
        if (this.rightSibling) {
            var node = this.rightSibling;
            while (node.children && node.children.length >= 1) {
                node = node.children[0];
            }
            return node;
        } else {
            if (this.parent) {
                return this.parent;
            } else {
                return null;
            }
        }
    };
    /** Returns the previous node in postorder. */
    Node.prototype.prevInPostorder = function prevInPostorder() {
        if (!this.children || this.children.length === 0) {
            var node = this;
            while (node.parent && !node.leftSibling) {
                node = this.parent;
            }
            if (node.leftSibling) {
                return node.leftSibling;
            } else {
                return null;
            }
        } else {
            return this.children[this.children.length - 1];
        }
    };
    /** Sets the parent node. */
    Node.prototype.setParent = function setParent(node) {
        this.parent = node;
        return this;
    };
    /** Adds a child node. */
    Node.prototype.addChild = function addChild(node) {
        this.children.push(node);
        return this;
    };
    /** Sets the left sibling node. */
    Node.prototype.setLeftSibling = function setLeftSibling(node) {
        this.leftSibling = node;
        return this;
    };
    /** Sets the right sibling node. */
    Node.prototype.setRightSibling = function setRightSibling(node) {
        this.rightSibling = node;
        return this;
    };
    /** Sets the left neighbor node. */
    Node.prototype.setLeftNeighbor = function setLeftNeighbor(node) {
        this.leftNeighbor = node;
        return this;
    };
    /** Sets the left most node. */
    Node.prototype.getLeftMost = function getLeftMost(depth) {
        if (depth <= 0) {
            return this;
        } else if (!this.children || this.children.length === 0) {
            return null;
        } else {
            var ancestor = this.children[0];
            var leftMost = ancestor.getLeftMost(depth - 1);
            while (!leftMost && ancestor.rightSibling) {
                ancestor = ancestor.rightSibling;
                leftMost = ancestor.getLeftMost(depth - 1);
            }
            return leftMost;
        }
    };
    /** Returns the level. */
    Node.prototype.getLevel = function getLevel() {
        if (this.level) {
            return this.level;
        } else {
            var level = 0;
            var node = this;
            while (node.parent) {
                level++;
                node = node.parent;
            }
            this.level = level;
            return level;
        }
    };

    var Tree = function _Class_Of_Tree_(node) {
        this.root = node || null;
        return this;
    };
    /** Applies given function to each node in preorder. */
    Tree.prototype.eachInPreorder = function eachInPreorder(callback, context) {
        var node = this.root;
        while (node) {
            callback.apply(node, context);
            node = node.nextInPreorder();
        }
    };
    /** Applies given function to each node in postorder. */
    Tree.prototype.eachInPostorder = function eachInPostorder(callback, context) {
        var node = this.root;
        while (node.children && node.children.length > 0) {
            node = node.children[0];
        }
        while (node) {
            callback.apply(node, context);
            node = node.nextInPostorder();
        }
    };
    /** Sets the tree's x coordinate. */
    Tree.prototype.setX = function setX(x) {
        this.root.x = x ? x : 0;
        return this;
    };
    /** Sets the tree's y coordinate. */
    Tree.prototype.setY = function setY(y) {
        this.root.y = y ? y : 0;
        return this;
    };
    /*
     * Represents queue class.
     */
    var Queue = function _Class_Of_Queue_(array) {
        this.queue = array ? array : [];
        return this;
    };
    /** Enqueues the given item. */
    Queue.prototype.enqueue = function enqueue(item) {
        this.queue.push(item);
    };
    /** Dequeues the currently handling queue. */
    Queue.prototype.dequeue = function dequeue() {
        if (this.queue.length > 0) {
            return this.queue.shift();
        } else {
            return null;
        }
    };
    /** Peeks the currently handling queue. */
    Queue.prototype.peek = function peek() {
        if (this.queue.length > 0) {
            return this.queue[0];
        } else {
            return null;
        }
    };
    /** Returns true if the currently handling queue is empty. */
    Queue.prototype.isEmpty = function isEmpty() {
        if (this.queue.length > 0) {
            return false;
        } else {
            return true;
        };
    };

    var convertStrategyToWalkerTree = function (strategy) {
        var queue = new Queue();
        var root = new Node(_strategy.getRootNode(strategy));
        queue.enqueue(root);
        var leftSibling = null;
        var rightSibling = null;
        var leftNeighbor = null;
        while (!queue.isEmpty()) {
            var node = queue.dequeue();
            var strategyChildNodes = _strategy.getDirectChildrenNodes(strategy, node._strategyNode);
            for (var i = 0; i < strategyChildNodes.length; i++) {
                var child = new Node(strategyChildNodes[i]).setParent(node);
                node.addChild(child);
                queue.enqueue(child);
            }
            rightSibling = (!queue.isEmpty() && node.parent === queue.peek().parent) ? queue.peek() : null;
            node.setLeftSibling(leftSibling).setRightSibling(rightSibling).setLeftNeighbor(leftNeighbor);
            leftSibling = (!queue.isEmpty() && node.parent === queue.peek().parent) ? node : null;
            if (leftSibling != null) {
                leftNeighbor = leftSibling;
            } else {
                leftNeighbor = (!queue.isEmpty() && node.getLevel() === queue.peek().getLevel()) ? node : null;
            }
        }
        return new Tree(root);
    };
    /*
     * Represents Walker's algorithm itself.
     */
    Algorithm = {
        'xAdjustment': 0,
        'yAdjustment': 0,
        'levelSeparation': 80,
        'siblingSeparation': 40,
        'subtreeSeparation': 100,
        'nodeWidth': 80,
        'nodeHeight': 40
    };
    /** Positions tree in accordance with the assigned configuration. */
    Algorithm.position = function position(tree) {
        tree.eachInPostorder(Algorithm.firstWalk);
        Algorithm.xAdjustment = tree.root.x;
        Algorithm.yAdjustment = tree.root.y + tree.root.preliminary;
        Algorithm.secondWalk(tree.root, 0);
        //This is to move tree so the top left node will have 0,0 coordinates
        Algorithm.postPosition(tree);
    };
    /** Walker's first walk. */
    Algorithm.firstWalk = function firstWalk() {
        if (!this.children || this.children.length === 0) {
            if (this.leftSibling) {
                this.preliminary = this.leftSibling.preliminary
                    + Algorithm.siblingSeparation
                    + Algorithm.nodeWidth;
            } else {
                this.preliminary = 0;
            }
        } else {
            var leftMost = this.children[0];
            var rightMost = this.children[this.children.length - 1];
            var middle = (leftMost.preliminary + rightMost.preliminary) / 2;
            if (this.leftSibling) {
                this.preliminary = this.leftSibling.preliminary
                    + Algorithm.siblingSeparation
                    + Algorithm.nodeWidth;
                this.modifier = this.preliminary - middle;
                Algorithm.apportion(this);
            } else {
                this.preliminary = middle;
            }
        }
    };
    /** Apportions for given node in accordance with the handling context. */
    Algorithm.apportion = function apportion(node) {
        var leftMost = node;
        var neighbor = node.leftNeighbor;
        var depth = 0;
        while (leftMost && neighbor) {
            var leftModifier = 0;
            var rightModifier = 0;
            var ancestorLeftMost = leftMost;
            var ancestorNeighbor = neighbor;
            for (var i = 0; i < depth; i++) {
                ancestorLeftMost = ancestorLeftMost.parent;
                ancestorNeighbor = ancestorNeighbor.parent;
                rightModifier += ancestorLeftMost.modifier;
                leftModifier += ancestorNeighbor.modifier;
            }
            var moveDistance = neighbor.preliminary
                + leftModifier
                + Algorithm.nodeWidth
                + Algorithm.subtreeSeparation
                - leftMost.preliminary
                - rightModifier;
            if (moveDistance > 0) {
                var tmp = node;
                var leftSiblings = 0;
                while (tmp && tmp !== ancestorNeighbor) {
                    leftSiblings++;
                    tmp = tmp.leftSibling;
                }
                if (tmp) {
                    var portion = moveDistance / leftSiblings;
                    tmp = node;
                    while (tmp && tmp !== ancestorNeighbor) {
                        tmp.preliminary = tmp.preliminary + moveDistance;
                        tmp.modifier = tmp.modifier + moveDistance;
                        moveDistance = moveDistance - portion;
                        tmp = tmp.leftSibling;
                    }
                } else {
                    return;
                }
            }
            depth++;
            leftMost = node.getLeftMost(depth);
            if (leftMost) {
                neighbor = leftMost.leftNeighbor;
            }
        }
    };
    /** Walker's second walk. */
    Algorithm.secondWalk = function secondWalk(node, modifier) {
        node.x = Algorithm.xAdjustment - node.getLevel() * (Algorithm.levelSeparation + Algorithm.nodeWidth);
        node.y = Algorithm.yAdjustment - (node.preliminary + modifier);
        if (node.children && node.children.length > 0) {
            Algorithm.secondWalk(node.children[0], modifier + node.modifier);
        }
        if (node.rightSibling) {
            Algorithm.secondWalk(node.rightSibling, modifier);
        }
    };
    /** This is to move tree so the top left node will have 0,0 coordinates */
    Algorithm.postPosition = function postPosition(tree) {
        var minX = 0;
        var minY = 0;
        tree.eachInPostorder(function (node) {
            if (node.x < minX) {
                minX = node.x;
            }
            if (node.y < minY) {
                minY = node.y;
            }
        });
        tree.eachInPostorder(function (node) {
            node.x = node.x - minX;
            node.y = node.y - minY;
        });
    };

    return {
        buildTreeLayout: function (strategy) {
            var tree = convertStrategyToWalkerTree(strategy);
            Algorithm.position(tree);
            return tree;
        }
    }
})()