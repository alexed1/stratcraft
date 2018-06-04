public with sharing abstract class BaseNode implements Comparable {
    @AuraEnabled public String name { get; set; }

    @AuraEnabled public String label { get; set; }

    @AuraEnabled public String description { get; set; }

    @AuraEnabled public String parentNodeName { get; set; }

    @AuraEnabled public String nodeType { get; protected set; }    

    public Integer compareTo(Object compareTo) {
        BaseNode otherNode = (BaseNode)compareTo;
        Integer result = this.nodeType.compareTo(otherNode.nodeType);
        if (result != 0) {
            return result;
        }
        return this.name.compareTo(otherNode.name);
    }
}