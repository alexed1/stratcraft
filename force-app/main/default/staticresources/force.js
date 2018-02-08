window._force = (function () {
  return {
    displayToast: function (title, message, type) {
      var toast = $A.get("e.force:showToast");

      // For lightning1 show the toast
      if (toast) {
        //fire the toast event in Salesforce1
        toast.setParams({
          "title": title,
          "message": message,
          "type": type || "other",
          "duration": 8000
        });

        toast.fire();
      } else { // otherwise throw an alert
        alert(title + ': ' + message);
      }
    },
  }
})()