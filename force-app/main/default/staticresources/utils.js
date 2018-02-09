window._utils = (function () {
  return {
    clone: function (obj, deep) {
      if (typeof obj === 'string') {
        return obj;
      }
      var newObj = new Object();
      if (obj instanceof Date) {
        newObj = new Date(obj);
      }
      else if (!deep && obj instanceof Array) {
        newObj = obj.slice(0);
      }
      else {
        for (var i in obj) {
          if (i == 'clone') continue;
          if (deep && typeof obj[i] == "object") {
            newObj[i] = obj[i].clone();
          } else {
            newObj[i] = obj[i];
          }
        }
      }
      return newObj;
    }
  }
})()