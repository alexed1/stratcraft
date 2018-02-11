({
    isNodeNameEmptyOrWhitespace: function (newNodeName) {
        return !newNodeName.trim();
    },

    isNodeNameExists: function (newNodeName, parentNodeNames) {
        var newNodeName = newNodeName.trim();
        var newNodeNameIndex = parentNodeNames.findIndex(function (item) { return item.trim().toLower() === newNodeName.toLower() });
        return newNodeNameIndex !== -1;
    }
})
