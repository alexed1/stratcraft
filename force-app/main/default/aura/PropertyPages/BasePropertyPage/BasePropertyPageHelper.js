({
    validate: function (cmp) {
        var validation = [
            this.validateBaseNode(cmp),
            this.validateSortNode(cmp),
            this.validateExternalConnectionNode(cmp),
            this.validateRecordJoin(cmp),
        ];
        return validation.reduce(function (validSoFar, valid) { return validSoFar && valid; }, true);
    },

    clearValidation: function (cmp) {
        var nodeComponents = [
            cmp.find('ifNode'),
            cmp.find('soqlLoadNode'),
            cmp.find('filterNode'),
            cmp.find('unionNode'),
            cmp.find('recommendationLimitNode'),
            cmp.find('sortNode'),
            cmp.find('externalConnectionNode'),
            cmp.find('recordJoinNode')
        ];
        nodeComponents.forEach(function (item) {
            if (item && item.clearValidation) {
                item.clearValidation();
            }
        });
    },

    validateBaseNode: function (cmp) {
        var nameCmp = cmp.find('name');
        var newName = (cmp.get('v._currentNodeDirty.name') || '').trim().toUpperCase();
        var currentNode = cmp.get('v.currentNode');
        var currentStrategy = cmp.get('v.currentStrategy');
        var errorLabelCmp = cmp.find('nameError');

        var nameIsValid = newName.length > 0 && !newName.match(/\s+/);
        if (nameIsValid) {
            var nameIsChanged = currentNode.name.trim().toUpperCase() != newName;
            nameIsValid = !nameIsChanged || !currentStrategy.nodes.find(function (item) {
                return item.name.toUpperCase() == newName;
            });
        }
        _cmpUi.toggleError(nameCmp, errorLabelCmp, nameIsValid);
        return nameIsValid;
    },

    validateSortNode: function (cmp) {
        var sortPropertiesCmp = cmp.find('sortNode');
        if (!sortPropertiesCmp) {
            return true;
        }
        return sortPropertiesCmp.validate();
    },

    validateExternalConnectionNode: function (cmp) {
        return true;
    },

    validateRecordJoin: function (cmp) {
        return true;
    },

    clearNodeTypes: function (cmp) {
        cmp.set('v.availableNodeTypes', []);
    },

    loadNodeTypes: function (cmp) {
        var nodeValueNamePairs = _utils.NodeType.getValueNamePairs();
        nodeValueNamePairs.unshift(['', '']);
        cmp.set('v.availableNodeTypes', nodeValueNamePairs);
    },

    loadParentNodes: function (cmp) {
        var currentStrategy = cmp.get('v.currentStrategy');
        var currentNode = cmp.get('v.currentNode');
        if (!currentStrategy || !currentNode) {
            cmp.set('v.availableParentNodes', []);
        } else {
            var allNodes = currentStrategy.nodes.filter(function (item) {
                return item.name !== currentNode.name && item.nodeType !== _utils.NodeType.EXTERNAL_CONNECTION;
            });
            allNodes = allNodes.sort(function (x, y) { return x.name.localeCompare(y.name); })
                .map(function (item) { return [item.name, item.name] });
            allNodes.unshift(['', '']);
            cmp.set('v.availableParentNodes', allNodes);
        }
    },

    removeEmptyNodeType: function (cmp) {
        var availableNodeTypes = cmp.get('v.availableNodeTypes');
        if (availableNodeTypes[0][0] == '') {
            availableNodeTypes.shift();
            cmp.set('v.availableNodeTypes', availableNodeTypes);
        }
    },

    reevaluateBranchesFlags: function (cmp, currentNode) {
        cmp.set("v._isBranchOfIfNode", false);
        cmp.set("v._isFirstBranch", false);
        cmp.set("v._isLastBranch", false);

        var curStrategy = cmp.get('v.currentStrategy');

        var parentNode = curStrategy.nodes.find(x => x.name === currentNode.parentNodeName);
        if (parentNode) {
            if (parentNode.nodeType === _utils.NodeType.IF) {
                cmp.set("v._isBranchOfIfNode", true);

                var ifNodeBranchesNodes = curStrategy.nodes.filter(x => x.parentNodeName == parentNode.name);
                var indexOfNode = ifNodeBranchesNodes.findIndex(x => x.name === currentNode.name);
                if (indexOfNode == 0)
                    cmp.set("v._isFirstBranch", true);
                if (indexOfNode + 1 == ifNodeBranchesNodes.length)
                    cmp.set("v._isLastBranch", true);
            }
        }
    }
})
