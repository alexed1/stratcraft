 // Represents an NBA Recommendation Strategy
    public with sharing class Strategy {
        public String name;
        public List<StrategyNode> nodes;

        public Strategy() {
        	nodes = new List<StrategyNode> ();
        }

        // given a Strategy and a node name, find the matching curNode
    	public StrategyNode FindNode (string targetName){
    		return nodes[0];
    	}
    }