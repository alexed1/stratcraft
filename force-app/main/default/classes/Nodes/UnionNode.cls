public with sharing class UnionNode extends BaseNode {

    @AuraEnabled public Boolean RemoveDuplicates { get; set; }

    public UnionNode() {
        this.NodeType = 'union';
    }
}