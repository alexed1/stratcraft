({
    doInit: function (cmp, event, helper) {

        //temporary for debug
        //var definition = cmg.get("v.definition");
        var definition = "{expressions: {\"PlatinumExperience\": \"$Record.Is_Qualifying_Stay__C == true || $Record.Loyalty_Level__c =‘Platinum Elite’\",\"GT10Stays\": \"$Record.Loyalty_Level__c ='Platinum Elite'\", \"TravelDisruption\": \"$Record.Loyalty_Level__c ='Gold Elite'\"},onlyFirstMatch: true}";
        //cmp.set("v.definition", definition);
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
        }

        cmp.set("v.filters", filters);




        ////////////for debug//////////////
        var treeItems = { "name": "RootNode", "label": "RootNode", "items": [{ "name": "IfPaymentPastDueElseChurnNode", "label": "IfPaymentPastDueElseChurnNode", "items": [{ "name": "222", "label": "222", "items": [], "href": null, "expanded": false }], "href": null, "expanded": true }, { "name": "333", "label": "333", "items": [], "href": null, "expanded": false }, { "name": "444", "label": "444", "items": [], "href": null, "expanded": false }], "href": null, "expanded": true };

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
        //populate selectable nodes
        var treeItems = cmp.set("v.selectableNodes", selectableNodes);
    },

    handleAddFilter: function (cmp, event, helper) {
        var filters = cmp.get("v.filters");
        filters.push({});
        cmp.set("v.filters", filters);
    }
})
