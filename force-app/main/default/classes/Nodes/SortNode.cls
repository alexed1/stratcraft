public with sharing class SortNode extends BaseNode {

    @AuraEnabled public String propositionsLimit  { get; set; }
    @AuraEnabled public List<SortKey> sortKeys { get; private set; }

    public SortNode() {
        nodeType = NodeTypes.SORT_NODE;
        sortKeys = new List<SortKey>();
        propositionsLimit = '';
    }
}