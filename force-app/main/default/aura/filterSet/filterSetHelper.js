({
    initSelectableNodes: function (cmp) {
        var curStrat = cmp.get("v.curStrat");
        var selectableNodes = curStrat.nodes.map((item) => item.name);
        cmp.set("v.selectableNodes", selectableNodes);
    },

    initFilters: function (cmp) {
        var definition = cmp.get("v.definition");

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

        if (cmp.get("v.isLoading"))
            return;

        var result = {};
        var expressions = {};
        result.expressions = expressions;

        var filters = cmp.get("v.filters");
        filters.forEach((item) => {
            expressions[item.selectedNodeName] = item.expression;
        })

        //add only first match
        result.onlyFirstMatch = cmp.get("v.onlyFirstMatch");

        var json = JSON.stringify(result);

        cmp.set("v.definition", json);
    }
})