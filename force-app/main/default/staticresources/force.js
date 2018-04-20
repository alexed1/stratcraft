window._force = (function () {
  return {
    displayToast: function (title, message, type, isSticky, timeout) {
      var toast = $A.get('e.force:showToast');
      // For lightning1 show the toast
      if (toast) {
        //fire the toast event in Salesforce1
        toast.setParams({
          'title': title,
          'message': message,
          'type': type || 'other',
          'duration': timeout || 8000,
          'mode': isSticky ? 'sticky' : 'dismissible'
        });

        toast.fire();
      } else {
        //We won't throw alert here because this branch is executed if the app is running in a test environment namely jasmine tests
        //In this case alert will require user interaction in order for tests to proceed
        //alert(title + ': ' + message);
      }
    },

    Icons: {
      Action: {
        Question: 'action:question_post_action',
        Delete: 'action:delete'
      }
    }
  }
})()