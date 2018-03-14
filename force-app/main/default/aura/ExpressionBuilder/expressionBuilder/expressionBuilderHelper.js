({
    splitExpressionIntoSubexpressions: function (expression) {
        var criteria = [];
        try {
            if (expression) {
                var expressionsArr = expression.split('$');
                for (var i = 0; i < expressionsArr.length; i++) {
                    var str = expressionsArr[i];
                    if (str != null) {
                        str = str.replace('&&', '');
                        str = str.replace('||', '').trim();
                        if (str) {
                            criteria.push('$' + str);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.log('Failed to parse expression "' + expression + "'. Error - " + JSON.stringify(error));
            return null;
        }
        return criteria;
    },

    unifyOperators: function (op) {
        var trimmedOp = op.replace('&', '').replace(';', '');
        switch (trimmedOp) {
            case 'eq':
            case '==':
                return '==';
            case 'nq':
            case '!=':
                return '!=';
            case 'lt':
            case '<':
                return '<';
            case 'gt':
            case '>':
                return '>';
            case 'lte':
            case '=<':
                return '=<';
            case 'gte':
            case '>=':
                return '>=';
            default:
                throw new Error('Can\'t parse operator: ' + op);
        }
    },
    /**Converts a single subexpression into a criteria. Returns null of subexpression can't be converted */
    convertSubexpressionToCrteria: function (subexpression) {
        self = this;
        if (!subexpression || subexpression === 'true' || subexpression === '$true') {
            return {
                objectName: '',
                fieldName: '',
                selectedOp: 'eq',
                value: ''
            };
        }
        //example: $Record.Strategy__c.LastModifiedById &amp;gt; (435)
        try {
            var tokens = subexpression.split(' ');
            var objectAndField = tokens[0];
            var operatorName = tokens[1];
            //if right side of equation had a whitespace, then it got splitted. glue it back
            var textValue = tokens.splice(2).join(' ');
            var objectName = objectAndField.substring('$Record.'.length, objectAndField.indexOf('.', '	$Record.'.length));
            var fieldName = objectAndField.substring(objectAndField.lastIndexOf('.') + 1);
            operatorName = self.unifyOperators(operatorName);
            return {
                objectName: objectName,
                fieldName: fieldName,
                selectedOp: operatorName,
                value: textValue
            };
        }
        catch (error) {
            console.log('Can\'t parse subexpression "' + subexpression + '". Error - ' + JSON.stringify(error));
            return null;
        }
    },
    /**Converts a string expression into a set of criteria objects. Returns null if expression can't be converted*/
    rebuildCriteriaFromExpression: function (expression) {
        if (!expression || expression === 'true') {
            return [];
        }
        self = this;
        var result = [];
        var isFailed = false;
        var subexpressions = self.splitExpressionIntoSubexpressions(expression);
        if (!subexpressions) {
            return null;
        }
        subexpressions.forEach(function (subexpression) {
            var criteria = self.convertSubexpressionToCrteria(subexpression);
            if (!criteria) {
                isFailed = true;
                return;
            }
            result.push(criteria);
        });
        if (isFailed) {
            return null;
        }
        return result;
    },

    //called when one of criterion value changes
    updateExpression: function (component, event, helper) {
        var criteria = component.get('v.criteria');
        var result = criteria.map(function (item) { item.criterionValue; }).join(' ');
        component.set('v.expression', result);
    }
})
