public with sharing class RecommendationLimitNodeJsonConverter extends BaseNodeJsonConverter {
    
    private RecommendationLimitNode prototypeNode;

    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        RecommendationLimitNode result = (RecommendationLimitNode)super.convertJsonToNode(jsonNode); 
        if (result == null) {
            return null;
        }
        result.RemoveDuplicates = (Boolean)jsonNode.get('removeDuplicates');
        result.MaxRecommendationCount = (Integer)jsonNode.get('maxRecommendationCount');
        result.LookbackDuration = (Integer)jsonNode.get('lookbackDuration');
        for (String child : (List<String>)jsonNode.get('filterModes')) {
            result.FilterModes.Add(child);
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
