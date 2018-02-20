public with sharing abstract class BaseNode {
    @AuraEnabled public String name { get; set; }

    @AuraEnabled public String description { get; set; }

    @AuraEnabled public String parentNodeName { get; set; }

    @AuraEnabled public String nodeType { get; protected set; }    
}