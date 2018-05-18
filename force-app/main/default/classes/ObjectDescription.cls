public with sharing class ObjectDescription {

     @AuraEnabled public String name;
     
     @AuraEnabled public String label;

     @AuraEnabled public List<ObjectFieldDescription> fieldList;


    public ObjectDescription(String name, String label) {
        this.name = name;
        this.label = label;
        this.fieldList = new List<ObjectFieldDescription>();
    }
}


