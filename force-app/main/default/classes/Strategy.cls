 // Represents an NBA Recommendation Strategy
    public with sharing class Strategy {

        @AuraEnabled public String name;
        @AuraEnabled public List<StrategyNode> nodes;
        @AuraEnabled public String description;
        @AuraEnabled public String masterLabel;


        public Strategy() {
        	nodes = new List<StrategyNode> ();
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

        
    }