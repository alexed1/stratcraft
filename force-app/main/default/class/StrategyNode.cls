public with sharing class StrategyNode {
    public StrategyNode() {

    }
    @AuraEnabled public String name;
    @AuraEnabled public String description;
    @AuraEnabled public String definition;
    @AuraEnabled public String type;
    @AuraEnabled public String parentNodeName;
    public Strategy parentStrategy;
    
    // given a Strategy and a node name, find the matching curNode
    public List<StrategyNode> FindChildNodes (){
        
        // for each node in nodes, if name matches, set to return and increment counter
        //if counter is > 1 throw exception
        List<StrategyNode> childNodes = new List<StrategyNode>();
        
        for(StrategyNode node : this.parentStrategy.nodes) {
            if (node.parentNodeName == this.name) {
                childNodes.add(node);
            }
        }

        return childNodes;
    }

}
