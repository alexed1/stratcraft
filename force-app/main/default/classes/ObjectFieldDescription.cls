public with sharing class ObjectFieldDescription {

    @AuraEnabled public String name;
    @AuraEnabled public String label;

    public ObjectFieldDescription(String name, String label) {
        this.name = name;
        this.label = label;
    }
}
