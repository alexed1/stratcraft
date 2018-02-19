public with sharing class IfNode extends BaseNode {

    @AuraEnabled public Boolean RemoveDuplicates { get; set; }

    @AuraEnabled public Boolean OnlyFirstMatch { get; set; }

    @AuraEnabled public List<IfBranch> Branches { get; private set; }

    public IfNode() {
        branches = new List<IfBranch>();
    }
}