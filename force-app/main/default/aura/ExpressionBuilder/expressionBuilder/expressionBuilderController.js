({
    handleSubExpressionAdd: function (cmp, event, helper) {
        var subExpressionIndex = event.getSource().get('v.value');
        var subExpressions = cmp.get('v.subExpressions');
        subExpressions.splice(subExpressionIndex + 1, 0, _expressionParser.createNewSubExpression(cmp.get('v._schema')));
        cmp.set('v.subExpressions', subExpressions);
        helper.focusSubExpression(cmp, subExpressionIndex + 1);
    },

    handleSubExpressionDelete: function (cmp, event, helper) {
        var subExpressionIndex = event.getSource().get('v.value');
        var subExpressions = cmp.get('v.subExpressions');
        subExpressions.splice(subExpressionIndex, 1);
        if (subExpressions.length === 0) {
            subExpressions.push(_expressionParser.createNewSubExpression(cmp.get('v._schema')));
            helper.focusSubExpression(cmp, 0);
        }
        cmp.set('v.subExpressions', subExpressions);
    },

    toggleBuilderMode: function (cmp, event, helper) {
        var isBuilderMode = cmp.get('v.isBuilderMode');
        if (isBuilderMode) {
            var expressionString = helper.resolveExpression(cmp);
            cmp.set('v.expression', expressionString);
            cmp.set('v.isBuilderMode', false);
        } else {
            var schema = cmp.get('v._schema');
            var stringExpression = cmp.get('v.expression');
            var expression = helper.parseExpression(stringExpression, schema);
            if (expression) {
                cmp.set('v.subExpressions', expression);
                cmp.set('v.isBuilderMode', true);
            } else {
                var overlay = cmp.find('popover');
                overlay.showCustomPopover({
                    body: 'The expression can\'t be parsed. Please fix the errors and try again',
                    referenceSelector: '.popover-host',
                    cssClass: "slds-popover,slds-p-around_x-small"
                }).then(function (overlay) {
                    setTimeout(function () {
                        overlay.close();
                    }, 1500);
                });
            }
        }
    },

    loadSchema: function (cmp, event, helper) {

        var loadingSchemaFunction = function (cmp, event, helper) {
            var self = this;
            var isIfMode = cmp.get('v.mode') === 'if';
            var typeList = cmp.get('v.contextTypesList');

            if (isIfMode)
                for (var i = 0; i < typeList.length; i++) {
                    var type = typeList[i];
                    for (var j = 0; j < type.fieldList.length; j++) {
                        var field = type.fieldList[j];
                        if (field.ifModeName)
                            field.name = field.ifModeName;
                    }
                }

            var mode = cmp.get('v.mode');
            var schema = helper.buildSchema(typeList, mode, cmp.get('v.strategy.contextType'));
            cmp.set('v._schema', schema);
            var strategy = cmp.get('v.strategy');
            var apexNames = [];
            var extConnectionTypes = {};
            if (schema.rootType.name === '$global' && strategy && strategy.externalConnections) {
                strategy.externalConnections.forEach(function (externalConnection) {
                    var type = {
                        name: '$' + externalConnection.name,
                        label: externalConnection.description,
                        fieldList: [],
                        fieldNameMap: {},
                        lookupFields: []
                    };
                    schema.typeList.push(type);
                    schema.typeNameMap[type.name] = type;
                    var field = {
                        name: type.name,
                        label: 'External connection "' + externalConnection.name + '"',
                        isReference: true,
                        type: type.name
                    };
                    schema.rootType.fieldList.push(field);
                    schema.rootType.fieldNameMap[field.name.toLowerCase()] = field;
                    if (externalConnection.type === 'apex') {
                        apexNames.push(externalConnection.action);
                        extConnectionTypes[externalConnection.action] = type;
                    }
                });
            }
            if (apexNames.length == 0) {
                helper.initializeBuilder(cmp);
                return;
            }
            //If we have apex connections in the current strategy then first we request session Id to make HTTP calls
            var sessionIdRequestedEvent = $A.get('e.c:sessionIdRequestedEvent');
            sessionIdRequestedEvent.setParams({
                'callback': function (sessionId) {
                    //Then we request details on these apex actions
                    var getApexDetailsAction = cmp.get('c.getApexActions');
                    getApexDetailsAction.setParams({
                        actionNames: apexNames,
                        sessionId: sessionId
                    });
                    getApexDetailsAction.setCallback(self, function (response) {
                        if (response.getState() === 'SUCCESS') {
                            var typeList = response.getReturnValue();
                            typeList.forEach(function (type) {
                                var extConnectionType = extConnectionTypes[type.name];
                                extConnectionType.fieldList = type.fieldList.map(function (field) {
                                    return {
                                        name: field.name,
                                        label: field.label,
                                        type: field.type,
                                        isReference: field.isReference
                                    };
                                });
                                extConnectionType.fieldNameMap = extConnectionType.fieldList.reduce(function (result, field) {
                                    result[field.name.toLowerCase()] = field;
                                    return result;
                                }, {});
                                extConnectionType.lookupFields = extConnectionType.fieldList.map(function (field) { return { type: extConnectionType, field: field } });
                            });
                        }
                        helper.initializeBuilder(cmp);
                    });
                    $A.enqueueAction(getApexDetailsAction);
                }
            });
            sessionIdRequestedEvent.fire();
        };

        if (cmp.get("v.scriptsAreLoaded"))
            loadingSchemaFunction(cmp, event, helper);
        else
            cmp.set('v._delayedInitialisationCallback', loadingSchemaFunction);
    },

    resolveExpression: function (cmp, event, helper) {
        return helper.resolveExpression(cmp);
    },

    handleValidate: function (cmp, event, helper) {
        return helper.validate(cmp);
    },

    scriptsAreLoaded: function (cmp, event, helper) {
        cmp.set("v.scriptsAreLoaded", true);
        var delayedInit = cmp.get('v._delayedInitialisationCallback');
        if (delayedInit)
            delayedInit(cmp, event, helper);
    }
})
