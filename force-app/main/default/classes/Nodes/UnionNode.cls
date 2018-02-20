public with sharing class UnionNode extends BaseNode {

    @AuraEnabled public Boolean removeDuplicates { get; set; }

    public UnionNode() {
        nodeType = NodeTypes.UNION;
    }
}