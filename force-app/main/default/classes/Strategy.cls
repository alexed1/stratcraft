 // Represents an NBA Recommendation Strategy
    public with sharing class Strategy {

        @AuraEnabled public String name;
        @AuraEnabled public List<StrategyNode> nodes;
        @AuraEnabled public String description;
        @AuraEnabled public String masterLabel;
        @AuraEnabled public Notification notification;
        @AuraEnabled public String recordId;


        public Strategy() {
        	nodes = new List<StrategyNode> ();
            notification = new Notification ();
        }


        // given a Strategy and a node name, find the matching curNode
    	public StrategyNode FindNodeByName (string targetName){
    		
            // for each node in nodes, if name matches, set to return and increment counter
            //if counter is > 1 throw exception
            StrategyNode targetNode = new StrategyNode();
            Integer counter = 0;
            for(StrategyNode node : this.nodes) {
                if (node.name == targetName) {
                    targetNode = node;
                    counter++;
                }
            }

            if (counter > 1) throw new BaseException('found more than one node with the same name');
            return targetNode;
    	}

        public String Persist () {
            System.debug('entering Strategy.Persist');
            string xmlString = XMLGenerator.StrategyToXML(this);
            System.debug('xml string after generation is: ' + xmlString);

            //don't get the salesforce Strategy__c confused with this, our in-memory strategy representation
            Strategy__c curStrategy = new Strategy__c();
            curStrategy.StrategyXML__c= xmlString;
            curStrategy.Name = this.name;
            System.debug('name string after generation is: ' + name);

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