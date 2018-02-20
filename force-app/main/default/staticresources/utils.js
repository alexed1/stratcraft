window._utils = (function () {
  return {
    /** Clones object and returns a new copy
     * @param {object} obj - object to clone
     * @param {bool} deep - true, if nested objects need to be cloned, otherwise false
     */
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
          if (deep && typeof obj[i] == 'object') {
            newObj[i] = obj[i].clone();
          } else {
            newObj[i] = obj[i];
          }
        }
      }
      return newObj;
    },

    /** Checks if two JSON strings are equal
     * @param {string} x - first JSON string
     * @param {string} y - second JSON string
      */
    areUndefinedOrEqual: function (x, y) {
      var result =
        (x == null && y == null)  //either both are undefined
        || //or both has value and values are equal 
        ((x != null && y != null)
          //something in aura changes control characters and strings that look equal are not equal,
          //so we strip characters with regexp removing whitespaces, tabs and carriage returns and compare the rest
          //we also remove quotation marks, since we use unstrict json and the only difference there might be a presense of quotation marks
          && x.replace(/[\s\"]/gi, '') == y.replace(/[\s\""]/gi, ''));
      return result;
    },

    /** Checks if string is undefined, null, empty or contains only whitespace symbols
     * @param {string} str - string to check
    */
    isEmptyOrWhitespace: function (str) {
      if (!str) {
        return true;
      }
      var str = str.trim();
      return !str;
    },

    /** Checks if an array of strings contains the specified string, using case-insensitive comparison and ignores leading and trailing whitespaces */
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
    },

    ModalDialogButtonType: {
      OK: 'OK',
      CANCEL: 'CANCEL'
    },

    NodeType: {
      IF: 'if',
      SOQL_LOAD: 'soqlLoad',
      UNION: 'union',
      FILTER: 'filter',
      RECOMMENDATION_LIMIT: 'recommendationLimit'
    }
  }
})()