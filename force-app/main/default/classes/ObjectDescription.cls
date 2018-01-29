public with sharing class ObjectDescription {

     @AuraEnabled public String name;
     @AuraEnabled public String label;

     @AuraEnabled public Map<String, String> fields;


    public ObjectDescription(String name, String label) {
        this.name = name;
        this.label = label;
        this.fields = new Map<String,String>();
    }
}


