({
    initSelectableNodes: function (cmp) {
        ////////////for debug//////////////
        //var treeItems = { "name": "RootNode", "label": "RootNode", "items": [{ "name": "IfPaymentPastDueElseChurnNode", "label": "IfPaymentPastDueElseChurnNode", "items": [{ "name": "222", "label": "222", "items": [], "href": null, "expanded": false }], "href": null, "expanded": true }, { "name": "333", "label": "333", "items": [], "href": null, "expanded": false }, { "name": "444", "label": "444", "items": [], "href": null, "expanded": false }], "href": null, "expanded": true };
        ///////////////////////////////////

        var treeItems = cmp.get("v.treeItems");

        if (treeItems.length == 0) {
            throw "The FilterSet tried to load the tree, but got zero items."
        }

        function flatten(data) {
            var result = [];
            result.push(data.name);
            for (var ob in data.items) {
                flatten(data.items[ob]).forEach((item) => result.push(item));
                result.push();
            }
            return result;
        }

        var selectableNodes = flatten(treeItems[0]);
        var treeItems = cmp.set("v.selectableNodes", selectableNodes);
    },

    initFilters: function (cmp) {
        //temporary for debug
        //var definition = "{expressions: {\"222\": \"$Record.Contact.LastModifiedDate &gt; (TODAY()-30) || $Record.Contact.LastModifiedDate &lt; (TODAY())\",\"333\": \"$Record.Contact.LastModifiedDate &gt; (TODAY()-30) || $Record.Contact.LastModifiedDate &lt; (TODAY())\"}, onlyFirstMatch: true}";
        /////////////////////

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


    //here we assemble all we have back to definition string in the node description
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