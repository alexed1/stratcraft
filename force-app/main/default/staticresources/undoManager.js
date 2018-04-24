/** Contains functions related to strategy undo/redo management */
window._undoManager = (function () {
    var addNode = function (strategy, node, index) {
        if (index == -1) {
            strategy.nodes.push(node);
        } else {
            strategy.nodes.splice(index, 0, [node]);
        }
    };
    var removeNode = function (strategy, node) {
        var index = strategy.nodes.findIndex(function (item) { return item.name === node.name });
        if (index !== -1) {
            strategy.nodes.splice(index, 1);
        }
        return index;
    };
    var replaceNode = function (strategy, oldNode, newNode) {
        var index = removeNode(strategy, oldNode);
        addNode(strategy, newNode, index);
    };
    var isBatchingOperations = false;
    var currentOperationBatch = [];
    var undoQueue = [];
    var addOperation = function (redoCallback, undoCallback) {
        if (isBatchingOperations) {
            currentOperationBatch.push({
                redo: redoCallback,
                undo: undoCallback
            });
        } else {
            undoQueue.push({
                isDone: true,
                redo: redoCallback,
                undo: undoCallback
            });
        }
    };
    return {
        /** Begins batching so all further operations will be undone/redone as a one */
        beginBatchOperations: function () {
            isBatchingOperations = true;
        },
        /** Ends batching and combines all operations added after call to beginBatchOperations */
        endBatchOperations: function () {
            if (currentOperationBatch.length > 0) {
                if (currentOperationBatch.length == 1) {
                    undoQueue.push({
                        isDone: true,
                        redo: currentOperationBatch[0].redo,
                        undo: currentOperationBatch[0].undo
                    });
                } else {
                    var localOperationBatch = currentOperationBatch;
                    undoQueue.push({
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
                    });
                }
                currentOperationBatch = [];
            }
            isBatchingOperations = false;
        },
        /** Registers adding node as an undoable operation */
        markNodeAdded: function (strategy, node) {
            addNode(strategy, node, -1);
            addOperation(
                function () {
                    addNode(strategy, node, -1);
                },
                function () {
                    removeNode(strategy, node);
                });
        },
        /** Registers removing node as an undoable operation */
        markNodeRemoved: function (strategy, node) {
            var index = strategy.nodes.findIndex(function (item) { return node.name === item.name; });
            removeNode(strategy, node);
            addOperation(
                function () {
                    removeNode(strategy, node);
                },
                function () {
                    addNode(strategy, node, index);
                });
        },
        /** Registers changing of the node properties as an undoable operation */
        markNodeChanged: function (strategy, oldNode, newNode) {
            replaceNode(strategy, oldNode, newNode);
            var index = strategy.nodes.findIndex(function (item) { return oldNode.name === item.name; });
            addOperation(
                function () { replaceNode(strategy, oldNode, newNode); },
                function () { replaceNode(strategy, newNode, oldNode); }
            );
        },
        /** Returns true if there is at least one operation in the current queue that can be undone */
        canUndo: function () {
            return undoQueue.some(function (item) { return item.isDone; });
        },
        /** Returns true if there is at least one operation in the current queue that can be redone */
        canRedo: function () {
            return undoQueue.some(function (item) { return !item.isDone; });
        },
        /** Undoes the last undoable operation */
        undo: function () {
            if (!this.canUndo()) {
                return;
            }
            var index = undoQueue.findIndex(function (item) { return !item.isDone; });
            var undoableOperation = undoQueue[index - 1];
            undoableOperation.undoCallback();
            undoableOperation.isDone = false;
        },
        /** Redoes the first redoable operation */
        redo: function () {
            if (!this.canRedo()) {
                return;
            }
            var index = undoQueue.findIndex(function (item) { return !item.isDone; });
            var redoableOperation = undoQueue[index];
            redoableOperation.redoCallback();
            redoableOperation.isDone = true;
        },
        /** Clears the undo queue */
        clear: function () {
            undoQueue = [];
            currentOperationBatch = [];
            isBatchingOperations = false;
        }
    }
})()