public with sharing class FilterNode extends BaseNode {

    @AuraEnabled public Boolean RemoveDuplicates { get; set; }

    @AuraEnabled public String Expression { get; set; }

    public FilterNode() {
        this.NodeType = 'filter';
    }    
}