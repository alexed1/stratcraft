({

    assembleCriteriasFromExpression: function (cmp, expression) {

        var criterias = [];

        if (expression) {
            //split by || or &&
            var expressionsArr = expression.split(/(\&\&)|(\|\|)/);

            var newCriteria = {};
            for (var i = 0; i < expressionsArr.length; i++) {
                var str = expressionsArr[i];
                if (str != null) {
                    if (!newCriteria["criteria"])
                        newCriteria.criteria = str.trim();
                    else {
                        newCriteria.condition = (str.trim() == "&&") ? "AND" : "OR";
                        criterias.push(newCriteria);
                        newCriteria = {};
                    }
                }
            }

            if (newCriteria["criteria"])
                criterias.push(newCriteria);
        }

        if (criterias.length == 0)
            criterias.push({});

        cmp.set("v.criterias", criterias);
    },


    notifyExpressionUpdate: function (cmp, event, helper) {

        var cmpEvent = $A.get("e.c:expressionUpdatedEvent");

        var criterias = cmp.get("v.criterias");

        var result = "";

        criterias.forEach((item) => {
            result += item.criteria;
            if (!item.condition)
                return;

            if (item.condition == "AND")
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
