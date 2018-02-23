public interface INodeJsonConverter {

    Boolean canConvertJsonToNode(Map<String, Object> jsonNode);

    BaseNode convertJsonToNode(Map<String, Object> jsonNode);
}
