({
    initSelectableNodes: function (cmp) {
        if (cmp.get("v.selectableNodes").length != 0)
            return;

        var currentStrategy = cmp.get("v.currentStrategy");
        if (currentStrategy) {
            var selectableNodes = currentStrategy.nodes.map((item) => item.name);
            cmp.set("v.selectableNodes", selectableNodes);
        }
    },

    initFilters: function (cmp) {
        if (cmp.get("v.nodeType") != '4') {
            return;
        }

        var definition = cmp.get("v.curNode").definition;

        //parse definition
        var filters = [];
        if (definition) {
            var obj = _parseJSON5(definition);
            if (obj.expressions) {
                //iterating properties
                Object.keys(obj.expressions).forEach(function (key, index) {
                    filters.push({ selectedNodeName: key, expression: obj.expressions[key] });
                });
            }
            if (obj.onlyFirstMatch) {
                cmp.set("v.onlyFirstMatch", obj.onlyFirstMatch);
            }
        }

        cmp.set("v.filters", filters);
    },


    //here we assemble all filters we have back to definition string in the node description
    updateDefinition: function (cmp) {

        if (cmp.get("v.nodeType") != '4')
            return;

        var curNode = cmp.get("v.curNode");

        var result = {};
        var expressions = {};
        result.expressions = expressions;

        var filters = cmp.get("v.filters");
        filters.forEach((item) => {
            expressions[item.selectedNodeName] = item.expression;
        })

        result.onlyFirstMatch = cmp.get("v.onlyFirstMatch");

        var json = JSON.stringify(result);

        curNode.definition = json;
        cmp.set("v.curNode", curNode);
    }
})