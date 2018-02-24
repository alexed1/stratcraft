public with sharing class RecommendationLimitNodeJsonConverter extends BaseNodeJsonConverter {
    
    private RecommendationLimitNode prototypeNode;

    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        RecommendationLimitNode result = (RecommendationLimitNode)super.convertJsonToNode(jsonNode); 
        if (result == null) {
            return null;
        }
        result.removeDuplicates = jsonNode.containsKey('removeDuplicates') ? (Boolean)jsonNode.get('removeDuplicates') : false;
        result.maxRecommendationCount = jsonNode.containsKey('maxRecommendationCount') ? (Integer)jsonNode.get('maxRecommendationCount') : 0;
        result.lookbackDuration = jsonNode.containsKey('lookbackDuration') ? (Integer)jsonNode.get('lookbackDuration') : 0;
        if (jsonNode.containsKey('filterModes')) {
            for (Object child : (List<Object>)jsonNode.get('filterModes')) {
                result.filterModes.Add((String)child);
            }
        }
        return result;
    }

    protected override BaseNode createNewNode() { return new RecommendationLimitNode(); }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new RecommendationLimitNode();
        }
        return prototypeNode;
    }
}
