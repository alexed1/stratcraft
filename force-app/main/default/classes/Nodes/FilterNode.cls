public with sharing class FilterNode extends BaseNode {

    @AuraEnabled public Boolean removeDuplicates { get; set; }

    @AuraEnabled public String expression { get; set; }

    public FilterNode() {
        nodeType = NodeTypes.FILTER;
    }    
}