public with sharing class ObjectFieldDescription {

    @AuraEnabled public String name;

    @AuraEnabled public String label;

    @AuraEnabled public String referenceTypeName;

    public ObjectFieldDescription(String name, String label, String referenceTypeName) {
        this.name = name;
        this.label = label;
        this.referenceTypeName = referenceTypeName;
    }
}
