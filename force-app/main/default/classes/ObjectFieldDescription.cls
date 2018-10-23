public with sharing class ObjectFieldDescription {

@AuraEnabled public String name;

@AuraEnabled public String ifModeName;

@AuraEnabled public String label;

@AuraEnabled public String type;

@AuraEnabled public Boolean isReference;

public ObjectFieldDescription(String name, String label, String type, Boolean isReference, String ifModeName) {
	this.name = name;
	this.ifModeName = ifModeName;
	this.label = label;
	this.type = type;
	this.isReference = isReference;
}
}
