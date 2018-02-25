public with sharing class Strategy {

    @AuraEnabled public String name { get; set; }

    @AuraEnabled public List<BaseNode> nodes { get; private set; }
    
    @AuraEnabled public String description { get; set; }
    
    @AuraEnabled public String masterLabel { get; set; }
    
    @AuraEnabled public Notification notification { get; private set;}
    
    @AuraEnabled public String Id { get; set; }

    public Strategy() {
        nodes = new List<BaseNode> ();
        notification = new Notification ();
    }
}