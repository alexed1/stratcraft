({
    doInit: function (cmp, event, helper) {

        //temporary for debug
        //var definition = cmg.get("v.definition");
        var definition = "{expressions: {\"PlatinumExperience\": \"$Record.Is_Qualifying_Stay__C == true || $Record.Loyalty_Level__c =‘Platinum Elite’\",\"GT10Stays\": \"$Record.Loyalty_Level__c ='Platinum Elite'\", \"TravelDisruption\": \"$Record.Loyalty_Level__c ='Gold Elite'\"},onlyFirstMatch: true}";
        //cmp.set("v.definition", definition);
        /////////////////////


        var filters = [];
        ////parse filters
        if (definition) {
            var obj = JSON.parse(helper.fixJSON(definition));
            if (obj.expressions && obj.expressions.length > 0) {
                //iterating properties
                Object.keys(obj).forEach(function (key, index) {
                    filters.push({ selectedNodeName: key, expression: obj[key] });
                });
            }
        }

        cmg.set("v.filters", filters);
    },

    handleAddFilter: function (cmp, event, helper) {
        var filters = cmp.get("v.filters");
        filters.push({});
        cmp.set("v.filters", filters);
    }
})
