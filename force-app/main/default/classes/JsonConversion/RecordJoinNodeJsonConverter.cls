public with sharing class RecordJoinNodeJsonConverter extends BaseNodeJsonConverter {
  


    
    
    private RecordJoinNode prototypeNode;

    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        RecordJoinNode result = (RecordJoinNode)super.convertJsonToNode(jsonNode); 
        if (result == null) {
            return null;
        }
        result.field = jsonNode.containsKey('field') ? (String)jsonNode.get('field') : '';
        result.incomingObject = jsonNode.containsKey('incomingObject') ? (String)jsonNode.get('incomingObject') : '';
        result.filterColumn = jsonNode.containsKey('filterColumn') ? (String)jsonNode.get('filterColumn') : '';
        result.filterValue = jsonNode.containsKey('filterValue') ? (String)jsonNode.get('filterValue') : '';
        result.joinColumn = jsonNode.containsKey('joinColumn') ? (String)jsonNode.get('joinColumn') : '';
        
        return result;
    }

    protected override BaseNode createNewNode() { return new RecordJoinNode(); }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new RecordJoinNode();
        }
        return prototypeNode;
    }

}
