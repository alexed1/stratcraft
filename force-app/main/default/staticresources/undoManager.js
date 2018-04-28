/** Contains functions related to strategy undo/redo management */
//Requires 'utils'
window._undoManager = (function () {
    //Private fields
    var _isBatchingOperations = false;
    var _currentOperationBatch = [];
    var _undoQueue = [];
    var _canUndoProperty = _utils.createProperty(false);
    var _canRedoProperty = _utils.createProperty(false);
    //Private methods
    var _canUndo = function () { return _undoQueue.length > 0 && _undoQueue.some(function (item) { return item.isDone; }); };

    var _canRedo = function () { return _undoQueue.length > 0 && _undoQueue.some(function (item) { return !item.isDone; }); };

    var _addOperationToUndoQueue = function (operation) {
        var insertOperationsAt = _undoQueue.findIndex(function (item) { return !item.isDone; });
        //It means that no operation was undone at the moment so we just add new operation to the end of the queue
        if (insertOperationsAt == -1) {
            _undoQueue.push(operation);
        } else {
            //Otherwise we are clearing all undone operations
            _undoQueue.splice(insertOperationsAt, _undoQueue.length - insertOperationsAt, operation);
        }
        _canUndoProperty.set(_canUndo());
        _canRedoProperty.set(_canRedo());
    };

    var _addAndRunOperation = function (redoCallback, undoCallback) {
        redoCallback();
        if (_isBatchingOperations) {
            _currentOperationBatch.push({
                redo: redoCallback,
                undo: undoCallback
            });
        } else {
            _addOperationToUndoQueue({
                isDone: true,
                redo: redoCallback,
                undo: undoCallback
            });
        }
    };

    var _addItem = function (array, item) {
        _addAndRunOperation(
            function () { array.push(item); },
            function () { array.splice(array.length - 1, 1); });
    };

    var _removeItem = function (array, item) {
        var index = array.indexOf(item);
        _addAndRunOperation(
            function () { array.splice(index, 1); },
            function () { array.splice(index, 0, item); });
    };

    var _replaceItem = function (array, oldItem, newItem) {
        var index = array.indexOf(oldItem);
        _addAndRunOperation(
            function () { array.splice(index, 1, newItem); },
            function () { array.splice(index, 1, oldItem); }
        );
    };

    var _changePropertyValue = function (item, propertyName, newValue) {
        var oldValue = item[propertyName];
        _addAndRunOperation(
            function () { item[propertyName] = newValue; },
            function () { item[propertyName] = oldValue; }
        );
    };
    /** Begins batching so all further operations will be undone/redone as a one */
    var _beginBatchOperations = function () {
        _isBatchingOperations = true;
    };
    /** Ends batching and combines all operations added after call to _beginBatchOperations */
    var _endBatchOperations = function () {
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
            _addOperationToUndoQueue(operationToAdd);
            _currentOperationBatch = [];
        }
        _isBatchingOperations = false;
    };

    //Public methods and properties
    return {
        /** Adds new node to the strategy and enables undo/redo for this operation */
        addNode: function (strategy, node) {
            _addItem(strategy.nodes, node);
        },
        /** Removes existing node from the strategy and enables undo/redo for this operation */
        removeNode: function (strategy, node) {
            _beginBatchOperations();
            var allChildren = _strategy.getAllChildrenNodes(strategy, node).reverse();
            allChildren.forEach(function (item) {
                _removeItem(strategy.nodes, item);
            });
            _removeItem(strategy.nodes, node);
            _endBatchOperations();
        },
        /** Updates properties of the strategy node and enables undo/redo for this operation */
        changeNode: function (strategy, oldNode, newNode) {
            _beginBatchOperations();
            var isNameChanged = oldNode.name != newNode.name;
            var isParentChanged = oldNode.parentNodeName != newNode.parentNodeName;
            var originalParent = _strategy.getParentNode(strategy, oldNode);
            var originalChildren = _strategy.getDirectChildrenNodes(strategy, oldNode);
            //Update parent of original children
            if (isNameChanged) {
                originalChildren.forEach(function (item) {
                    _changePropertyValue(item, 'name', newNode.name);
                });
                //If parent node refers the current one in one of its branches, we should update this branch
                //If original parent is empty then we are renaming the root node
                if (originalParent && originalParent.nodeType == _utils.NodeType.IF) {
                    if (originalParent.branches) {
                        originalParent.branches.forEach(function (item) {
                            if (item.child == oldNode.name) {
                                _changePropertyValue(item, 'child', newNode.name);
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
                        _changePropertyValue(item, 'parentNodeName', newParentName);
                    });
                }
                //There is no 'else' as in this case changedNode will already have changes and will be injected into strategy
            }
            var index = strategy.nodes.findIndex(function (item) { return item.name == oldNode.name; });
            _replaceItem(strategy.nodes, strategy.nodes[index], newNode);
            _endBatchOperations();
        },
        /** Returns true if there is at least one operation in the current queue that can be undone */
        canUndo: _utils.createNoSetterProperty(_canUndoProperty),
        /** Returns true if there is at least one operation in the current queue that can be redone */
        canRedo: _utils.createNoSetterProperty(_canRedoProperty),
        /** Undoes the last undoable operation */
        undo: function () {
            if (!this.canUndo()) {
                return;
            }
            var index = _undoQueue.findIndex(function (item) { return !item.isDone; });
            if (index == -1) {
                index = _undoQueue.length;
            }
            var undoableOperation = _undoQueue[index - 1];
            undoableOperation.undo();
            undoableOperation.isDone = false;
            _canUndoProperty.set(_canUndo());
            _canRedoProperty.set(_canRedo());
        },
        /** Redoes the first redoable operation */
        redo: function () {
            if (!this.canRedo()) {
                return;
            }
            var index = _undoQueue.findIndex(function (item) { return !item.isDone; });
            var redoableOperation = _undoQueue[index];
            redoableOperation.redo();
            redoableOperation.isDone = true;
            _canUndoProperty.set(_canUndo());
            _canRedoProperty.set(_canRedo());
        },
        /** Clears the undo queue */
        clear: function () {
            _undoQueue = [];
            _currentOperationBatch = [];
            _isBatchingOperations = false;
            _canUndoProperty.set(_canUndo());
            _canRedoProperty.set(_canRedo());
        }
    }
})()