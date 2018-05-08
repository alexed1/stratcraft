({
    doInit: function (component, event, helper) {

        var currentUrl = window.location.href;

        //for example
        //https://andreic1-dev-ed.lightning.force.com/one/one.app#/n/andreic__Strategy_Crafter
        var splitedUrl = currentUrl.split('/');
        var lastPart = splitedUrl[splitedUrl.length - 1];

        var prefixSeparatorIndex = lastPart.lastIndexOf('__');
        var organizationPrefix = '';

        if (prefixSeparatorIndex > 0)
            organizationPrefix = lastPart.substr(0, prefixSeparatorIndex) + '__';

        var url = '/apex/' + organizationPrefix + 'sessionIdRetrievalVFPage?parentUrl=' + currentUrl;
        component.set("v.callerURL", url);

        var sessionId;

        var listenerFunction = function (event) {
            //xss vulnerability?
            var sessionId = event.data;
            component.set("v.showVFPage", false);
            component.set("v.sessionId", sessionId);
            window.removeEventListener("message", listenerFunction);
        };


        window.addEventListener("message", listenerFunction, true);
    },
})
