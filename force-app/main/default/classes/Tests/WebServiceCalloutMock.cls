public with sharing class WebServiceCalloutMock implements IWebServiceCallout {

    public class WebServiceCalloutParameters {
        public Object stub;

        public Object request;

        public Map<String, Object> response;

        public List<String> infoArray;
    }

    public List<WebServiceCalloutMock.WebServiceCalloutParameters> parameters;

    public WebServiceCalloutMock() {
        parameters = new List<WebServiceCalloutMock.WebServiceCalloutParameters>();
    }

    public void invoke(Object stub, Object request, Map<String,Object> response, List<String> infoArray) {
        WebServiceCalloutMock.WebServiceCalloutParameters parameter = new WebServiceCalloutMock.WebServiceCalloutParameters();
        parameter.stub = stub;
        parameter.request = request;
        parameter.response = response;
        parameter.infoArray = infoArray;
        parameters.add(parameter);
    }
}