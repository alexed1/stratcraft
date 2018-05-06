public interface IWebServiceCallout {
    void invoke(Object stub, Object request, Map<String,Object> response, List<String> infoArray);
}