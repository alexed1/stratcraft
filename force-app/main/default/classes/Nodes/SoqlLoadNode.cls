public with sharing class SoqlLoadNode extends BaseNode {

    @AuraEnabled public String Soql { get; set; }

    @AuraEnabled public String FieldNameRemapping { get; set;}

    public SoqlLoadNode() {
        this.NodeType = 'soqlLoad';
    }
}