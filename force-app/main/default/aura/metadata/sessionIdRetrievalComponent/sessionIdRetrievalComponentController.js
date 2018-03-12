({
    doInit: function (component, event, helper) {

        var url = '/apex/sessionIdRetrievalVFPage?parentUrl=' + window.location.href;
        component.set("v.callerURL", url);

        var sessionId;

        var listenerFunction = function(event){
            //xss vulnerability?
            var sessionId = event.data;
            component.set("v.showVFPage", false);
            component.set("v.sessionId", sessionId);
            window.removeEventListener("message", listenerFunction);
        };


        window.addEventListener("message", listenerFunction, true);
    },
})
