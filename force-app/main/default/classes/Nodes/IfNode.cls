public with sharing class IfNode extends BaseNode {

    @AuraEnabled public Boolean removeDuplicates { get; set; }

    @AuraEnabled public Boolean onlyFirstMatch { get; set; }

    @AuraEnabled public List<IfBranch> branches { get; private set; }

    public IfNode() {
        nodeType = NodeTypes.IF_NODE;
        branches = new List<IfBranch>();
    }
}