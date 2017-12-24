public with sharing class StratCraft {
    public StratCraft() {

    }

 // Represents an NBA Recommendation Strategy
    public with sharing class StrategyNode {
        public String name;
        public String description;
        public String definition;
        public String type;
        public String parentNode;
    }

    // Represents an NBA Recommendation Strategy
    public with sharing class Strategy {
        public String name;
        public List<StrategyNode> nodes;

        public Strategy() {
        	nodes = new List<StrategyNode> ();
        }
    }
}
