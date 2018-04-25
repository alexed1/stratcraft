/** Contains functions related to strategy undo/redo management */
window._undoManager = (function () {
    var _addNode = function (strategy, node, index) {
        if (index == -1) {
            strategy.nodes.push(node);
        } else {
            strategy.nodes.splice(index, 0, [node]);
        }
    };
    var _removeNode = function (strategy, node) {
        var index = strategy.nodes.findIndex(function (item) { return item.name === node.name });
        if (index !== -1) {
            strategy.nodes.splice(index, 1);
        }
        return index;
    };
    var _replaceNode = function (strategy, oldNode, newNode) {
        var index = _removeNode(strategy, oldNode);
        _addNode(strategy, newNode, index);
    };
    var _isBatchingOperations = false;
    var _currentOperationBatch = [];
    var _undoQueue = [];
    var _addAndRunOperation = function (redoCallback, undoCallback) {
        redoCallback();
        if (_isBatchingOperations) {
            _currentOperationBatch.push({
                redo: redoCallback,
                undo: undoCallback
            });
        } else {
            _undoQueue.push({
                isDone: true,
                redo: redoCallback,
                undo: undoCallback
            });
        }
    };
    var _markNodeAdded = function (strategy, node) {
        _addAndRunOperation(
            function () { _addNode(strategy, node, -1); },
            function () { _removeNode(strategy, node); });
    };
    var _markNodeRemoved = function (strategy, node) {
        var index = strategy.nodes.findIndex(function (item) { return node.name === item.name; });
        _addAndRunOperation(
            function () { _removeNode(strategy, node); },
            function () { _addNode(strategy, node, index); });
    };
    var _markNodeChanged = function (strategy, oldNode, newNode) {
        var index = strategy.nodes.findIndex(function (item) { return oldNode.name === item.name; });
        _addAndRunOperation(
            function () { _replaceNode(strategy, oldNode, newNode); },
            function () { _replaceNode(strategy, newNode, oldNode); }
        );
    };
    var _markPropertyValueChanged = function (item, propertyName, newValue) {
        var oldValue = item[propertyName];
        _addAndRunOperation(
            function () { item[propertyName] = newValue; },
            function () { item[propertyName] = oldValue; }
        );
    };
    return {
        /** Begins batching so all further operations will be undone/redone as a one */
        beginBatchOperations: function () {
            _isBatchingOperations = true;
        },
        /** Ends batching and combines all operations added after call to beginBatchOperations */
        endBatchOperations: function () {
            if (_currentOperationBatch.length > 0) {
                var operationToAdd = null;
                if (_currentOperationBatch.length == 1) {
                    operationToAdd = {
                        isDone: true,
                        redo: _currentOperationBatch[0].redo,
                        undo: _currentOperationBatch[0].undo
                    };
                } else {
                    var localOperationBatch = _currentOperationBatch;
                    operationToAdd = {
                        isDone: true,
                        redo: function () {
                            localOperationBatch.reverse().forEach(function (item) {
                                item.redo();
                            });
                        },
                        undo: function () {
                            localOperationBatch.forEach(function (item) {
                                item.undo();
                            });
                        }
                    };
                }
                var insertOperationsAt = _undoQueue.findIndex(function (item) { return !item.isDone; });
                //It means that no operation was undone at the moment so we just add new operation to the end of the queue
                if (insertOperationsAt == -1) {
                    _undoQueue.push(operationToAdd);
                } else {
                    //Otherwise we are clearing all undone operations
                    _undoQueue = _undoQueue.splice(insertOperationsAt, _undoQueue.length - insertOperationsAt, [operationToAdd]);
                }
                _currentOperationBatch = [];
            }
            _isBatchingOperations = false;
        },
        /** Adds new node to the strategy and enables undo/redo for this operation */
        addNode: function (strategy, node) {
            _markNodeAdded(strategy, node);
        },
        /** Removes existing node from the strategy and enables undo/redo for this operation */
        removeNode: function (strategy, node) {
            this.beginBatchOperations();
            var allChildren = _strategy.getAllChildrenNodes(strategy, oldNode).reverse();
            allChildren.forEach(function (item) {
                _markNodeRemoved(item);
            });
            _markNodeRemoved(strategy, oldNode);
            this.endBatchOperations();
        },
        /** Updates properties of the strategy node and enables undo/redo for this operation */
        changeNode: function (strategy, oldNode, newNode) {
            var isNameChanged = oldNode.name != newNode.name;
            var isParentChanged = oldNode.parentNodeName != newNode.parentNodeName;
            var originalParent = _strategy.getParentNode(strategy, oldNode);
            var originalChildren = _strategy.getDirectChildrenNodes(strategy, oldNode);
            //Update parent of original children
            if (isNameChanged) {
                originalChildren.forEach(function (item) {
                    _markPropertyValueChanged(item, 'name', newNode.name);
                });
                //If parent node refers the current one in one of its branches, we should update this branch
                //If original parent is empty then we are renaming the root node
                if (originalParent && originalParent.nodeType == _utils.NodeType.IF) {
                    if (originalParent.branches) {
                        originalParent.branches.forEach(function (item) {
                            if (item.child == oldNode.name) {
                                _markPropertyValueChanged(item, 'child', newNode.name);
                            }
                        });
                    }
                }
            }
            //Update children
            if (isParentChanged) {
                //TODO: process the case where empty node is selected as a new parent
                var isMovingToOwnChild = _strategy.isParentOf(strategy, oldNode.name, newNode.parentNodeName);
                if (isMovingToOwnChild) {
                    originalChildren.forEach(function (item) {
                        var newParentName = originalParent ? originalParent.name : '';
                        _markPropertyValueChanged(item, 'parentNodeName', newParentName);
                    });
                }
                //There is no 'else' as in this case changedNode will already have changes and will be injected into strategy
            }
            var index = strategy.nodes.findIndex(function (item) { return item.name == oldNode.name; });
            _markNodeChanged(strategy, strategy.nodes[index], newNode);
        },
        /** Returns true if there is at least one operation in the current queue that can be undone */
        canUndo: function () {
            return _undoQueue.some(function (item) { return item.isDone; });
        },
        /** Returns true if there is at least one operation in the current queue that can be redone */
        canRedo: function () {
            return _undoQueue.some(function (item) { return !item.isDone; });
        },
        /** Undoes the last undoable operation */
        undo: function () {
            if (!this.canUndo()) {
                return;
            }
            var index = _undoQueue.findIndex(function (item) { return !item.isDone; });
            var undoableOperation = _undoQueue[index - 1];
            undoableOperation.undoCallback();
            undoableOperation.isDone = false;
        },
        /** Redoes the first redoable operation */
        redo: function () {
            if (!this.canRedo()) {
                return;
            }
            var index = _undoQueue.findIndex(function (item) { return !item.isDone; });
            var redoableOperation = _undoQueue[index];
            redoableOperation.redoCallback();
            redoableOperation.isDone = true;
        },
        /** Clears the undo queue */
        clear: function () {
            _undoQueue = [];
            _currentOperationBatch = [];
            _isBatchingOperations = false;
        }
    }
})()