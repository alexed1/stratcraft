public with sharing abstract class BaseNode {
    @AuraEnabled public String Name { get; set; }

    @AuraEnabled public String Description { get; set; }

    @AuraEnabled public String ParentNodeName { get; set; }

    @AuraEnabled public String NodeType { get; protected set; }    
}