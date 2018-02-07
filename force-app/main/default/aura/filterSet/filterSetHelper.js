({
    initSelectableNodes: function (cmp) {
        ////////////for debug//////////////
        var treeItems = { "name": "RootNode", "label": "RootNode", "items": [{ "name": "IfPaymentPastDueElseChurnNode", "label": "IfPaymentPastDueElseChurnNode", "items": [{ "name": "222", "label": "222", "items": [], "href": null, "expanded": false }], "href": null, "expanded": true }, { "name": "333", "label": "333", "items": [], "href": null, "expanded": false }, { "name": "444", "label": "444", "items": [], "href": null, "expanded": false }], "href": null, "expanded": true };
        ///////////////////////////////////

        function flatten(data) {
            var result = [];
            result.push(data.name);
            for (var ob in data.items) {
                flatten(data.items[ob]).forEach((item) => result.push(item));
                result.push();
            }
            return result;
        }

        var selectableNodes = flatten(treeItems);
        var treeItems = cmp.set("v.selectableNodes", selectableNodes);
    },

    initFilters: function (cmp) {
        //temporary for debug
        //var definition = cmg.get("v.definition");
        var definition = "{expressions: {\"222\": \"$Record.Contact.LastModifiedDate &gt; (TODAY()-30) || $Record.Contact.LastModifiedDate &lt; (TODAY())\",\"333\": \"$Record.Contact.LastModifiedDate &gt; (TODAY()-30) || $Record.Contact.LastModifiedDate &lt; (TODAY())\"}, onlyFirstMatch: true}";
        /////////////////////

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


    updateDefinition: function (cmp) {

        var result = {};

        var filters = cmp.get("v.filters");

        //construct object

        //add only first match

        // cmp.set("v.definition", result);
    }
})