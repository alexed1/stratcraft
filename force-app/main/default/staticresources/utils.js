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
    },

    //Checks if string is undefined, null, empty or contains only whitespace symbols
    isEmptyOrWhitespace: function (str) {
      if (!str) {
        return true;
      }
      var str = str.trim();
      return !str;
    },

    //Checks if an array of strings contains the specified string, using case-insensitive comparison and ignores leading and trailing whitespaces
    arrayIncludesStringCI: function (array, str) {
      if (!array || str === undefined || str === null) {
        return false;
      }
      var str = (str || '').trim().toLowerCase();
      var strIndex = array.findIndex(function (item) {
        return item.trim().toLowerCase() === str;
      });
      return strIndex !== -1;
    },

    NodeRequestType: {
      ALL: 'ALL',
      ALL_EXCEPT_CURRENT: 'ALL_EXCEPT_CURRENT',
      IMMEDIATE_ANTECENDENT: 'IMMEDIATE_ANTECENDENT',
      ALL_ANTECENDENTS: 'ALL_ANTECENDENTS',
      SIBLINGS: 'SIBLINGS',
      IMMEDIATE_DESCENDANTS: 'SIBLINGS',
      ALL_DESCENDANTS: 'ALL_DESCENDANTS'
    },

    StrategyChangeType: {
      ADD_NODE: 'ADD_NODE'
    }
  }
})()