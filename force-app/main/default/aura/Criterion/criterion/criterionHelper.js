({
	assembleCriterion: function (cmp, event, helper, objectName, fieldName, op, textValue) {

		var operator = helper.unifyOperators(op);
		if (operator != '==' && operator != '!=')
			operator = '&' + operator + ';';

		var str = '$Record.' + objectName + '.' + fieldName + ' ' + operator + ' ' + textValue;
		cmp.set('v.criterionValue', str);
	},

	initExistingCriterion: function (cmp, helper) {

		var criterion = cmp.get('v.criterionValue');
		if (!criterion)
			return false;
		if (criterion === '$true')
			return false;
		//example: $Record.Strategy__c.LastModifiedById &amp;gt; (435)
		try {

			var tokens = criterion.split(' ');

			var objectAndField = tokens[0];
			var operatorName = tokens[1];

			//if right side of equation had a whitespace, then it got splitted. glue it back
			var textValue = tokens.splice(2).join(' ');

			var objectName = objectAndField.substring('$Record.'.length, objectAndField.indexOf('.', '	$Record.'.length));
			var fieldName = objectAndField.substring(objectAndField.lastIndexOf('.') + 1);

			operatorName = helper.unifyOperators(operatorName);

			cmp.set('v.selectedObjectName', objectName);
			cmp.set('v.selectedFieldName', fieldName);
			cmp.set('v.selectedOp', operatorName);
			cmp.set('v.rightSideValue', textValue);
		}
		catch (e) {
			throw new Error('Couldn\'t parse existing criterion', e);
		}
		return true;
	},

	resetCriterion: function (cmp) {
		cmp.set('v.criterionValue', '');
	},

	notifyCriterionValueUpdate: function (cmp) {
		var cmpEvent = $A.get('e.c:criterionUpdatedEvent');
		cmpEvent.setParams({
			'criterion': cmp.get('v.criterionValue')
		});
		cmpEvent.fire();
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
				return 'lt';
			case 'gt':
			case '>':
				return 'gt';
			case 'lte':
			case '=<':
				return 'lte';
			case 'gte':
			case '>=':
				return 'gte';
			default:
				throw new Error('Can\'t parse operator: ' + op);
		}
	}
})