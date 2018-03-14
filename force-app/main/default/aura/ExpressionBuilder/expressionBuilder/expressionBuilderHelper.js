({

    assembleCriteriaFromExpression: function (cmp, expression) {

        var criteria = [];

        if (expression) {

            var expressionsArr = expression.split('$');
            for (var i = 0; i < expressionsArr.length; i++) {
                var str = expressionsArr[i];
                if (str != null) {
                    str = str.replace('&&', '');
                    str = str.replace('||', '').trim();
                    if (str != '') {
                        var newCriterion = {};
                        newCriterion.criterionValue = '$' + str;
                        criteria.push(newCriterion);
                    }
                }
            }
        }

        if (criteria.length == 0)
            criteria.push({});

        cmp.set("v.criteria", criteria);
    },


    //called when one of criterion value changes
    updateExpression: function (cmp, event, helper) {
        var criteria = cmp.get("v.criteria");
        var result = criteria.map((item) => item.criterionValue).join(' ');
        cmp.set("v.expression", result);
    }
})
