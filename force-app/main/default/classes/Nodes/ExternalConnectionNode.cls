public with sharing class ExternalConnectionNode extends BaseNode {

    @AuraEnabled public String body { get; set; }
	@AuraEnabled public String type { get; set; }
	@AuraEnabled public String action { get; set; }

	

	@AuraEnabled public List<ArgumentPair> argPairs { get; private set; }
    

    public ExternalConnectionNode() {
        nodeType = NodeTypes.EXTERNAL_CONNECTION;
        argPairs = new List<ArgumentPair>();
    }
}