public with sharing class FilterNodeJsonConverter extends BaseNodeJsonConverter {

    private FilterNode prototypeNode;
    
    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        FilterNode result = (FilterNode)super.convertJsonToNode(jsonNode);
        if (result == null) {
            return result;
        }
        result.removeDuplicates = jsonNode.containsKey('removeDuplicates') ? (Boolean)jsonNode.get('removeDuplicates') : false;
        result.expression = jsonNode.containsKey('expression') ? (String)jsonNode.get('expression') : '';
        return result;
    }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new FilterNode();
        }
        return prototypeNode;
    }

    protected override BaseNode createNewNode() { return new FilterNode(); }
}
