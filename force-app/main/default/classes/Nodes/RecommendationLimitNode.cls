public with sharing class RecommendationLimitNode extends BaseNode {

    @AuraEnabled public Boolean removeDuplicates { get; set; }

    @AuraEnabled public List<String> filterModes { get; private set; }

    @AuraEnabled public Integer maxRecommendationCount { get; set; }

    @AuraEnabled public Integer lookbackDuration { get; set; }

    public RecommendationLimitNode() {
        nodeType = NodeTypes.RECOMMENDATION_LIMIT;
        filterModes = new List<String>();
    }
}