public with sharing class Strategy {

    @AuraEnabled public String Name { get; set; }

    @AuraEnabled public List<BaseNode> Nodes { get; private set; }
    
    @AuraEnabled public String Description { get; set; }
    
    @AuraEnabled public String MasterLabel { get; set; }
    
    @AuraEnabled public Notification Notification { get; private set;}
    
    @AuraEnabled public String Id { get; set; }

    public Strategy() {
        Nodes = new List<StrategyNode> ();
        Notification = new Notification ();
    }

    public StrategyNode findNodeByName (String targetName) {
        for (BaseNode node : this.Nodes) {
            if (node.Name == targetName) {
                return node;
            }
        }
        return null;
    }

    public String Persist () {
        System.debug('entering Strategy.Persist');
        string xmlString = XMLGenerator.StrategyToXML(this);
        System.debug('xml string after generation is: ' + xmlString);

        //don't get the salesforce Strategy__c confused with this, our in-memory strategy representation
        Strategy__c curStrategy = new Strategy__c();
        curStrategy.StrategyXML__c= xmlString;
        curStrategy.Name = this.name;
        curStrategy.Id = this.Id;
        System.debug('name string after generation is: ' + name);
        System.debug('ID is: ' + this.Id);
        try {
            upsert curStrategy;
            return 'successfully persisted';
        } 
        catch (DmlException e) {

            for (Integer i = 0; i < e.getNumDml(); i++) {
                // Process exception here
                System.debug(e.getDmlMessage(i)); 
            }

            return ('error: ' + e.getDmlMessage(0));
        }


    }

        
    }