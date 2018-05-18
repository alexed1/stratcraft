public with sharing class ObjectFieldDescription {

    @AuraEnabled public String name;

    @AuraEnabled public String label;

    @AuraEnabled public String typeName;

    @AuraEnabled public Boolean isReference;

    public ObjectFieldDescription(String name, String label, String typeName, Boolean isReference) {
        this.name = name;
        this.label = label;
        this.typeName = typeName;
        this.isReference = isReference;
    }
}
