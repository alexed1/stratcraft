public with sharing class SoqlLoadNode extends BaseNode {

    @AuraEnabled public String soql { get; set; }

    @AuraEnabled public String fieldNameRemapping { get; set;}

    public SoqlLoadNode() {
        nodeType = NodeTypes.SOQL_LOAD;
    }
}