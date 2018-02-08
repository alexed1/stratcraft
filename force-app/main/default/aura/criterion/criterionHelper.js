({
	assembleCriterion: function (cmp, event, helper, objectName, fieldName, op, textValue) {
		var str = '$Record.' + objectName + '.' + fieldName + ' &' + op + '; (' + textValue + ')';
		cmp.set("v.criterionValue", str);
	},

	initExistingCriterion: function (cmp) {

		var criterion = cmp.get("v.criterionValue");
		if (!criterion)
			return false;

		//example: $Record.Strategy__c.LastModifiedById &amp;gt; (435)
		try {
			var objectAndField = criterion.substring(0, criterion.indexOf(' '));
			var objectName = objectAndField.substring('$Record.'.length, objectAndField.indexOf('.', '	$Record.'.length));
			var fieldName = objectAndField.substring(objectAndField.lastIndexOf('.') + 1);
			var operatorName = criterion.substring(criterion.indexOf('&') + 1, criterion.indexOf(';')).trim();
			var textValue = criterion.substring(criterion.indexOf('(') + 1, criterion.lastIndexOf(')'));

			cmp.set("v.selectedObjectName", objectName);
			cmp.set("v.selectedFieldName", fieldName);
			cmp.set("v.selectedOp", operatorName);
			cmp.set("v.rightSideValue", textValue);
		}
		catch (e) {
			throw new Error("Couldn't parse existing criterion", e);
		}
		return true;
	},

	resetCriterion: function (cmp) {
		cmp.set("v.criterionValue", '');
	},

	notifyCriterionValueUpdate: function (cmp) {
		var cmpEvent = $A.get("e.c:criterionUpdatedEvent");
		cmpEvent.setParams({
			"criterion": cmp.get("v.criterionValue")
		});
		cmpEvent.fire();
	}
})