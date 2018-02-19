public with sharing class RecommendationLimitNode extends BaseNode {

    @AuraEnabled public Boolean RemoveDuplicates { get; set; }

    @AuraEnabled public List<String> FilterModes { get; private set; }

    @AuraEnabled public Integer MaxRecommendationCount { get; set; }

    @AuraEnabled public Integer LookbackDuration { get; set; }

    public RecommendationLimitNode() {
        filterModes = new List<String>();
    }
}