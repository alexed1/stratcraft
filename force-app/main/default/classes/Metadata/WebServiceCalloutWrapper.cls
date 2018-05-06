public with sharing class WebServiceCalloutWrapper implements IWebServiceCallout {
    public void invoke(Object stub, Object request, Map<String,Object> response, List<String> infoArray) {
        WebServiceCallout.invoke(stub, request, response, infoArray);
    }
}