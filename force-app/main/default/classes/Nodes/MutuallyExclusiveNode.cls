public with sharing class MutuallyExclusiveNode extends BaseNode {

@AuraEnabled public List<IfBranch> branches { get; private set; }

public MutuallyExclusiveNode() {
	nodeType = NodeTypes.MUTUALLY_EXCLUSIVE;
	branches = new List<IfBranch>();
}
}
