public with sharing class FilterNodeJsonConverter extends BaseNodeJsonConverter {

    private FilterNode prototypeNode;
    
    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        FilterNode result = (FilterNode)super.convertJsonToNode(jsonNode);
        if (result == null) {
            return result;
        }
        result.RemoveDuplicates = Boolean.valueOf((Boolean)jsonNode.get('removeDuplicates'));
        result.Expression = (String)jsonNode.get('expression');
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
