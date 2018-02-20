public with sharing class SoqlLoadNodeJsonConverter extends BaseNodeJsonConverter {
    
    private SoqlLoadNode prototypeNode;

    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        SoqlLoadNode result = (SoqlLoadNode)super.convertJsonToNode(jsonNode); 
        if (result == null) {
            return null;
        }
        result.soql = (String)jsonNode.get('soql');
        result.fieldNameRemapping = jsonNode.containsKey('fieldNameRemapping') ? (String)jsonNode.get('fieldNameRemapping') : null;
        return result;
    }

    protected override BaseNode createNewNode() { return new SoqlLoadNode(); }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new SoqlLoadNode();
        }
        return prototypeNode;
    }
}
