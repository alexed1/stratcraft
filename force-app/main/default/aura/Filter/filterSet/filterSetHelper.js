({
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

        cmp.set("v.currentNode", cmp.get("v.currentNode"));
    }
})