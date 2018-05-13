({
    getChildComponents: function (cmp) {
        return [
            cmp.find('filter'),
            cmp.find('argumentPair'),
            cmp.find('sortConfig')
        ];
    },

    validate: function (cmp) {
        var result = true;
        var childCmpList = this.getChildComponents(cmp);
        childCmpList.forEach(function (item) {
            if (item && item.validate && !item.validate()) {
                result = false;
            }
        });
        return result;
    },

    clearValidation: function (cmp) {
        var childCmpList = this.getChildComponents(cmp);
        childCmpList.forEach(function (item) {
            if (item && item.clearValidation) {
                item.clearValidation();
            }
        });
    },

    updateSelectableNodes: function (cmp) {
        var currentNode = cmp.get('v.currentNode');
        if (!currentNode) {
            return;
        }
        var nodeDataRequestEvent = $A.get('e.c:nodeDataRequestEvent');
        nodeDataRequestEvent.setParams({
            'nodeName': currentNode.name,
            'nodeRelationship': _utils.NodeRequestType.IMMEDIATE_DESCENDANTS,
            'callback': function (nodes) {
                var result = [];
                nodes.forEach(function (item) { result.push(item.name); });
                cmp.set('v.selectableNodes', result);
            }
        });
        nodeDataRequestEvent.fire();
    },

    handlePriorityButtons: function (cmp, event, helper) {

        if (cmp.get('v.memberType') != 'filter')
            return false;
        var curNode = cmp.get('v.currentNode');
        if (!curNode)
            return;

        var filters = cmp.find("filter");
        if (filters) {
            for (var i = 0; i < filters.length; i++) {
                var item = filters[i].get('v.currentItem')
                var index = filters[i].get("v.index");
                if (item) {
                    item['isSortable'] = true;
                    item['isFirstBranch'] = index == 0;
                    item['isLastBranch'] = index == (curNode.branches.length - 1);
                    filters[i].set("v.curentItem", item);
                }
            }
        }

        cmp.set("v.currentNode", cmp.get("v.currentNode"));
    }
})