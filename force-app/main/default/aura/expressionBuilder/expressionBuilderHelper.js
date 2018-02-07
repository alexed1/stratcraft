({
    notifyExpressionUpdate: function (cmp, event, helper) {
        var cmpEvent = $A.get("e.c:expressionUpdatedEvent");

        var criterias = cmp.get("v.criterias");

        var result = "";

        criterias.forEach((item) => {
            result += item.criteria;
            if (!item.condition)
                return;

            if (item.conditon == "AND")
                result += " && ";
            else
                if (item.condition == "OR")
                    result += " || ";
        });


        cmpEvent.setParams({
            "expression": result
        });
        cmpEvent.fire();
    }
})
