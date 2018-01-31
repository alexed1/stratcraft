({
	assembleCriteria: function (cmp, event, helper, objectName, fieldName, op, textValue) {
		var str = '$Record.' + objectName + '.' + fieldName + ' &' + op + '; (' + textValue + ')';
		cmp.set("v.criteria", str);
	},

	initExistingCriteria: function (cmp) {

		var criteria = cmp.get("v.criteria");
		if (!criteria)
			return false;

		//example: $Record.Strategy__c.LastModifiedById &amp;gt; (435)
		try {
			var objectAndField = criteria.substring(0, criteria.indexOf(' '));
			var objectName = objectAndField.substring('$Record.'.length, objectAndField.indexOf('.', '$Record.'.length));
			var fieldName = objectAndField.substring(objectAndField.lastIndexOf('.') + 1);
			var operatorName = criteria.substring(criteria.indexOf('&') + 1, criteria.indexOf(';')).trim();
			var textValue = criteria.substring(criteria.indexOf(';') + 1).trim();

			cmp.set("v.selectedObjectName", objectName);
			cmp.set("v.selectedFieldName", fieldName);
			cmp.set("v.selectedOp", operatorName);
			cmp.set("v.textValue", textValue);
		}
		catch (e) {
			throw new Error("Couldn't parse existing criteria", e);
		}
		return true;
	},

	resetCriteria: function (cmp) {
		cmp.set("v.criteria", '');
	}
})