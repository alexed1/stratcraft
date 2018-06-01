window._utils = (function () {

	Array.prototype.findLast = function (predicate) {
		for (var index = this.length - 1; index >= 0; index--) {
			if (predicate(this[index])) {
				return this[index];
			}
		}
	};

	if (!Element.prototype.scrollIntoViewIfNeeded) {
		Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
			function withinBounds(value, min, max, extent) {
				if (false === centerIfNeeded || max <= value + extent && value <= min + extent) {
					return Math.min(max, Math.max(min, value));
				} else {
					return (min + max) / 2;
				}
			}

			function makeArea(left, top, width, height) {
				return {
					"left": left, "top": top, "width": width, "height": height
					, "right": left + width, "bottom": top + height
					, "translate":
						function (x, y) {
							return makeArea(x + left, y + top, width, height);
						}
					, "relativeFromTo":
						function (lhs, rhs) {
							var newLeft = left, newTop = top;
							lhs = lhs.offsetParent;
							rhs = rhs.offsetParent;
							if (lhs === rhs) {
								return area;
							}
							for (; lhs; lhs = lhs.offsetParent) {
								newLeft += lhs.offsetLeft + lhs.clientLeft;
								newTop += lhs.offsetTop + lhs.clientTop;
							}
							for (; rhs; rhs = rhs.offsetParent) {
								newLeft -= rhs.offsetLeft + rhs.clientLeft;
								newTop -= rhs.offsetTop + rhs.clientTop;
							}
							return makeArea(newLeft, newTop, width, height);
						}
				};
			}

			var parent, elem = this, area = makeArea(
				this.offsetLeft, this.offsetTop,
				this.offsetWidth, this.offsetHeight);
			while ((parent = elem.parentNode) instanceof HTMLElement) {
				var clientLeft = parent.offsetLeft + parent.clientLeft;
				var clientTop = parent.offsetTop + parent.clientTop;

				// Make area relative to parent's client area.
				area = area.
					relativeFromTo(elem, parent).
					translate(-clientLeft, -clientTop);

				parent.scrollLeft = withinBounds(
					parent.scrollLeft,
					area.right - parent.clientWidth, area.left,
					parent.clientWidth);

				parent.scrollTop = withinBounds(
					parent.scrollTop,
					area.bottom - parent.clientHeight, area.top,
					parent.clientHeight);

				// Determine actual scroll amount by reading back scroll properties.
				area = area.translate(clientLeft - parent.scrollLeft,
					clientTop - parent.scrollTop);
				elem = parent;
			}
		};
	};

	// List of HTML entities for escaping.
	var htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'/': '&#x2F;'
	};
	// Regex containing the keys listed immediately above.
	var htmlEscaper = /[&<>"'\/]/g;
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
						newObj[i] = this.clone(obj[i]);
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

		validateXML: function (xml) {

			var recommendationStrategyName = '';
			try {
				//very stupid but robust way to find a strategy name
				recommendationStrategyName = xml.split('recommendationStrategyName')[1].replace('>', '').replace('</', '').trim();
			}
			catch{ }

			const startsWith = 'This page contains the following errors:';
			const endsWith = 'Below is a rendering of the page up to the first error.';
			try {
				if (document.implementation.createDocument) {
					var parser = new DOMParser();
					var myDocument = parser.parseFromString(xml, "text/xml");
					if (myDocument.documentElement.firstChild.localName === 'parsererror') {
						var result = myDocument.documentElement.firstChild.innerText;
						if (result.startsWith(startsWith)) {
							result = result.substr(startsWith.length);
							result = result.charAt(0).toUpperCase() + result.slice(1);
						}
						if (result.endsWith(endsWith)) {
							result = result.substr(0, result.length - endsWith.length);
						}
						if (result)
							return { errors: result, name: recommendationStrategyName };
					}
				} else if (window.ActiveXObject) {
					var myDocument = new ActiveXObject("Microsoft.XMLDOM")
					myDocument.async = false
					var nret = myDocument.loadXML(xml);
					if (!nret) {
						return { name: recommendationStrategyName, errors: 'XML is invalid' };
					}
				}
			} catch (e) {
				return { name: recommendationStrategyName };    //maybe the user-agent does not support both, then it should be submitted and let server-side validation do the job
			}
			return { name: recommendationStrategyName };
		},

		escapeHtml: function (str) {
			// Escape a string for HTML interpolation
			return ('' + str).replace(htmlEscaper, function (match) {
				return htmlEscapes[match];
			});
		},

		getPackagePrefix: function () {
			//Url will be like https://myorg.lightning.force.com/lightning/n/prefix__Strategy_Crafter
			//              or https://myorg.lightning.force.com/lightning/n/Strategy_Crafter
			var packagePart = window.location.href.split('/');
			packagePart = packagePart[packagePart.length - 1];
			packagePart = packagePart.split('__');
			if (packagePart.length == 1) {
				//We are in the org where no prefix is set up for our package - return default namespace
				return 'c';
			}
			return packagePart[0];
		},

		getComponentName: function (componentName) {
			var packageName = this.getPackagePrefix();
			return packageName + ':' + componentName;
		},

		NodeRequestType: {
			ALL: 'ALL',
			ALL_EXCEPT_CURRENT: 'ALL_EXCEPT_CURRENT',
			IMMEDIATE_ANTECENDENT: 'IMMEDIATE_ANTECENDENT',
			ALL_ANTECENDENTS: 'ALL_ANTECENDENTS',
			SIBLINGS: 'SIBLINGS',
			IMMEDIATE_DESCENDANTS: 'IMMEDIATE_DESCENDANTS',
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
			RECOMMENDATION_LIMIT: 'recommendationLimit',
			SORT: 'sort',
			EXTERNAL_CONNECTION: 'actionContext',
			RECORD_JOIN: 'recordJoin',
			MUTUALLY_EXCLUSIVE: 'mutuallyExclusive',
			getValueNamePairs: function (isExternalConnectionMode) {
				if (isExternalConnectionMode) {
					return [[this.EXTERNAL_CONNECTION, 'External Connection']];
				}
				return [
					[this.IF, 'Gate'],
					[this.SOQL_LOAD, 'Load Propositions'],
					[this.FILTER, 'Filter'],
					[this.UNION, 'Combine'],
					[this.RECOMMENDATION_LIMIT, 'Prevent Re-Offers'],
					[this.SORT, 'Sort'],
					[this.RECORD_JOIN, 'Record Join'],
					[this.MUTUALLY_EXCLUSIVE, 'Mutually Exclusive']
				];
			}
		},
		//Creates C# or Java-like property that allow to get and set values and subscribe to change notifications
		createProperty: function (defaultValue) {
			var _value = defaultValue;
			var _changeHandlers = [];
			var get = function () { return _value; };
			var set = function (value) {
				if (value !== _value) {
					_value = value;
					_changeHandlers.forEach(function (item) { item(value); });
				}
			}
			var result = function (newValue) {
				if (arguments.length == 0) {
					return get();
				} else {
					set(newValue);
				}
			};
			result.get = get;
			result.set = set;
			result.addChangeHandler = function (handler) {
				if (handler) {
					_changeHandlers.push(handler);
				}
				return handler;
			};
			result.removeChangeHandler = function (handler) {
				var index = _changeHandlers.indexOf(handler);
				if (index == -1) {
					return undefined;
				}
				_changeHandlers.splice(index, 1);
				return handler;
			};
			return result;
		},
		//Creates C# or Java-like property with no setter from another property
		createNoSetterProperty: function (property) {
			var result = function () { return property(); }
			result.get = property.get();
			result.addChangeHandler = property.addChangeHandler;
			result.removeChangeHandler = property.removeChangeHandler;
			return result;
		}
	}
})()