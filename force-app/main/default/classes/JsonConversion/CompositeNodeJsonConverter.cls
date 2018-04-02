public with sharing class CompositeNodeJsonConverter implements INodeJsonConverter {
    
    private List<INodeJsonConverter> converters;

    public CompositeNodeJsonConverter() {
        converters = new List<INodeJsonConverter>();
        converters.add((INodeJsonConverter)new SoqlLoadNodeJsonConverter());
        converters.add((INodeJsonConverter)new UnionNodeJsonConverter());
        converters.add((INodeJsonConverter)new IfNodeJsonConverter());
        converters.add((INodeJsonConverter)new FilterNodeJsonConverter());
        converters.add((INodeJsonConverter)new RecommendationLimitNodeJsonConverter());
        converters.add((INodeJsonConverter)new SortNodeJsonConverter());
        converters.add((INodeJsonConverter)new ExternalConnectionNodeJsonConverter());
        converters.add((INodeJsonConverter)new RecordJoinNodeJsonConverter());
    }

    public Boolean canConvertJsonToNode(Map<String, Object> jsonNode) {
        for (INodeJsonConverter converter : converters) {
            if (converter.canConvertJsonToNode(jsonNode)) {
                return true;
            }
        }
        return false;
    }

    public BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        for (INodeJsonConverter converter : converters) {
            if (converter.canConvertJsonToNode(jsonNode)) {
                return converter.convertJsonToNode(jsonNode);
            }
        }
        return null;
    }
}
