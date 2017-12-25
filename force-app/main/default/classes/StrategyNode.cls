public with sharing class StrategyNode {
    public StrategyNode() {

    }

    @AuraEnabled public String name {get; set;}
    @AuraEnabled public String description {get; set;}
    @AuraEnabled public String definition {get; set;}
    @AuraEnabled public String type {get; set;}
    @AuraEnabled public String parentNodeName {get; set;}
    @AuraEnabled public Strategy parentStrategy {get; set;}
    
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
