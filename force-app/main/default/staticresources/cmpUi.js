window._cmpUi = (function () {
    return {
        toggleSpinner: function (cmp, spinnerId) {
            var spinnerIdResolved = spinnerId || "mySpinner";
            var spinner = cmp.find(spinnerIdResolved);
            if (spinner != null) {
                $A.util.toggleClass(spinner, "slds-hide");
            }
            else {
                console.log('Failed to find spinner with Id ' + spinnerIdResolved)
            }
        }
    }
})()