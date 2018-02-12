({
    isNodeNameEmptyOrWhitespace: function (newNodeName) {
        return !newNodeName || !newNodeName.trim();
    },

    isNodeNameExists: function (newNodeName, parentNodeNames) {
        var newNodeName = (newNodeName || '').trim().toLowerCase();
        var newNodeNameIndex = parentNodeNames.findIndex(function (item) {
            return item.trim().toLowerCase() === newNodeName;
        });
        return newNodeNameIndex !== -1;
    }
})
