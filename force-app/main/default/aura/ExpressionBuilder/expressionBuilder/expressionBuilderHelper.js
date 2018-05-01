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
        var trimmedOp = op.replace('&', '').replace(';', '').trim();
        switch (trimmedOp) {
            case 'eq':
            case '==':
            case '=':
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
            case 'like':
                return 'like';
            default:
                throw new Error('Can\'t parse operator: ' + op);
        }
    },

    convertOperatorToSoql: function (cmp, op) {
        if (cmp.get("v.mode") == 'soql')
            if (op == '==') //I guess all othere operators for soql are the same
                op = '='

        return op;
    },

    /**Converts a single subexpression into a criteria. Returns null of subexpression can't be converted */
    convertSubexpressionToCriteria: function (subexpression) {
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

    /**Converts a string expression or soql expression into a set of criteria objects. Returns null if expression can't be converted*/
    rebuildCriteriaFromExpression: function (expression, isSoqlMode) {

        if (!expression || expression === 'true') {
            return [];
        }
        self = this;
        var result = [];
        var isFailed = false;

        if (isSoqlMode)
            return self.buildCriteriaFromSoql(expression);


        var subexpressions = self.splitExpressionIntoSubexpressions(expression);
        if (!subexpressions) {
            return null;
        }
        subexpressions.forEach(function (subexpression) {
            var criteria = self.convertSubexpressionToCriteria(subexpression);
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

    buildCriteriaFromSoql: function (expression) {
        var whereStatement = expression.split('WHERE')[1].trim();
        var partsOfStatement = whereStatement.split(' OR ');
        var result = [];
        try {
            partsOfStatement.forEach(function (subexpression) {
                //Example WHERE Name = 'Hot Waffle Press' OR Name = 'X120' OR Name = 'X240'
                var tokens = subexpression.split(' ');
                var fieldName = tokens[0];
                var operatorName = tokens[1];
                //if right side of equation had a whitespace, then it got splitted. glue it back
                var textValue = tokens.splice(2).join(' ');
                operatorName = self.unifyOperators(operatorName);
                result.push({
                    objectName: 'Proposition',
                    fieldName: fieldName,
                    selectedOp: operatorName,
                    value: textValue
                });
            });

        } catch (error) {
            console.log('Can\'t parse soql expression "' + whereStatement + '". Error - ' + JSON.stringify(error));
            return null;
        }
        return result;
    },

    //called when one of criterion value changes
    updateExpression: function (cmp, event, helper) {
        var criteria = cmp.get('v.criteria');
        var result = criteria.map(function (item) { item.criterionValue; }).join(' ');
        cmp.set('v.expression', result);
    },

    insertMissingFieldsAndObjects: function (criteria, allObjects) {
        criteria.forEach(function (criteriaItem) {
            var existingObject = allObjects.filter(function (item) {
                return item.name === criteriaItem.objectName;
            });
            if (existingObject.length === 0) {
                var label = criteriaItem.objectName.endsWith('__c')
                    ? criteriaItem.objectName.slice(0, criteriaItem.length - 3)
                    : criteriaItem.objectName;
                existingObject = [{
                    name: criteriaItem.objectName,
                    label: criteriaItem.objectName,
                    fields: []
                }];
                allObjects.push(existingObject);
            }
            var existingField = existingObject[0].fields.filter(function (item) {
                return item.name === criteriaItem.fieldName;
            });
            if (existingField.length === 0) {
                var label = criteriaItem.fieldName.endsWith('__c')
                    ? criteriaItem.fieldName.slice(0, criteriaItem.fieldName.length - 3)
                    : criteriaItem.fieldName;
                existingObject[0].fields.push({
                    name: criteriaItem.fieldName,
                    label: label
                });
            }
        });
    },

    initExpressionBuilder: function (cmp, allObjects) {
        var helper = this;

        var isSoqlMode = cmp.get('v.mode') == 'soql';
        if (isSoqlMode)
            var expression = cmp.get('v.soqlExpression');
        else
            var expression = cmp.get('v.expression');

        var criteria = [];
        if (expression) {
            criteria = helper.rebuildCriteriaFromExpression(expression, isSoqlMode);
            //If expression can't be parse then criteria will be null
            if (!criteria) {

                //this is really bad. We have an expression, but can't parse it.
                //I think we should throw an error
                throw Error('We couldn\'t parse an expression');

                cmp.set('v.isBuilderMode', false);
                cmp.set('v.isLoading', false);
                return;
            }

            //This is to make sure, that if criteria object or its field don't exist in current org, then we add them to the list
            helper.insertMissingFieldsAndObjects(criteria, allObjects)
        }

        if (criteria.length == 0) {
            criteria.push({
                objectName: '',
                fieldName: '',
                selectedOp: '',
                value: ''
            });
        }

        //Post processing: for each object sort fields by name ascending, add empty field
        //sort all objects by name ascending and add empty object
        var emptySelectionObject = { name: '', label: '--None--' };
        allObjects.forEach(function (item) {
            item.fields.sort(function (x, y) {
                return x.label.localeCompare(y.label);
            });
            item.fields.splice(0, 0, emptySelectionObject);
        });
        allObjects.sort(function (x, y) {
            return x.label.localeCompare(y.label);
        });
        allObjects.splice(0, 0, emptySelectionObject);

        //preselect selectedObject to be Proposition if we are talking about soql expression
        if (cmp.get("v.mode") == 'soql') {
            criteria[0].objectName = 'Proposition';
        }

        cmp.set('v.availableObjects', allObjects);
        cmp.set('v.criteria', criteria);
        cmp.set('v.isLoading', false);
    },

    resolveSoqlExpressionToCriteria: function (cmp) {
        var self = this;
        var criteria = cmp.get('v.criteria');
        if (!criteria || criteria.length === 0)
            return null;
        else {
            var expression = 'SELECT Name, Description, ActionReference FROM Proposition WHERE ';
            var whereStatement = criteria.map(function (item) {
                if (item.objectName === '' || item.fieldName === '' || item.selectedOp === '' || item.value === '') {
                    return null;
                }
                var operator = self.convertOperatorToSoql(cmp, self.unifyOperators(item.selectedOp));
                return item.fieldName + ' ' + operator + ' ' + item.value;
            }).filter(function (item) { return item; })
                .join(' OR ');

            if (whereStatement && whereStatement.length > 0)
                return expression + whereStatement;
            else
                return '';
        }
    }
})
