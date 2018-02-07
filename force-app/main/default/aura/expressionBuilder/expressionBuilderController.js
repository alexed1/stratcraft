({
    doInit: function (cmp, event, helper) {



        //TODO: criteria parsing from string


        cmp.set("v.criterias",
            [{ criteria: "$Record.Contact.LastModifiedDate &gt; (TODAY()-30)", condition: "AND" },
            { criteria: "$Record.Contact.LastModifiedDate &lt; (TODAY())" }]);
    },

    handleCriteriaDelete: function (cmp, event, helper) {
        var criterias = cmp.get("v.criterias");
        var index = event.getParam("index");

        //if we deleted last element, we should clear condition of previous element
        if (criterias.length != 1 && criterias.length == index + 1) {
            criterias[index - 1].condition = "";
        }

        criterias.splice(index, 1);
        cmp.set("v.criterias", criterias);

        helper.notifyExpressionUpdate(cmp, event, helper);
    },

    handleCriteriaAdd: function (cmp, event, helper) {
        var criterias = cmp.get("v.criterias");
        var index = event.getParam("index");
        //update condition
        var criteriaCaller = criterias[index];
        var oldCondition = criteriaCaller.condition;
        criteriaCaller.condition = event.getParam("condition");
        //insert empty condition
        criterias.splice(index + 1, 0, { condition: oldCondition });
        cmp.set("v.criterias", criterias);

        helper.notifyExpressionUpdate(cmp, event, helper);
    },

    handleCriterionUpdatedEvent: function (cmp, event, helper) {
        helper.notifyExpressionUpdate(cmp, event, helper);
    }
})
