public with sharing class Strategy {

    @AuraEnabled public String Name { get; set; }

    @AuraEnabled public List<BaseNode> Nodes { get; private set; }
    
    @AuraEnabled public String Description { get; set; }
    
    @AuraEnabled public String MasterLabel { get; set; }
    
    @AuraEnabled public Notification Notification { get; private set;}
    
    @AuraEnabled public String Id { get; set; }

    public Strategy() {
        Nodes = new List<BaseNode> ();
        Notification = new Notification ();
    }

    public BaseNode findNodeByName (String targetName) {
        for (BaseNode node : this.Nodes) {
            if (node.Name == targetName) {
                return node;
            }
        }
        return null;
    }
}