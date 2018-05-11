window._cmpUi = (function () {
    return {
        spinnerOn: function (cmp, spinnerId) {
            var spinnerIdResolved = spinnerId || "mySpinner";
            var spinner = cmp.find(spinnerIdResolved);
            if (spinner != null) {
                $A.util.removeClass(spinner, "slds-hide");
            }
            else {
                console.log('Failed to find spinner with Id ' + spinnerIdResolved)
            }
        },
        spinnerOff: function (cmp, spinnerId) {
            var spinnerIdResolved = spinnerId || "mySpinner";
            var spinner = cmp.find(spinnerIdResolved);
            if (spinner != null) {
                $A.util.addClass(spinner, "slds-hide");
            }
            else {
                console.log('Failed to find spinner with Id ' + spinnerIdResolved)
            }
        },

        toggleError: function (valueCmp, errorLabelCmp, isValid) {
            if (isValid) {
                $A.util.removeClass(valueCmp, 'slds-has-error');
                $A.util.addClass(errorLabelCmp, 'slds-hide');
            } else {
                $A.util.addClass(valueCmp, 'slds-has-error');
                $A.util.removeClass(errorLabelCmp, 'slds-hide');
            }
        },
    }
})()