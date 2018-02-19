public with sharing class UnionNodeXmlConverter extends BaseNodeXmlConverter {
    
    private UnionNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        UnionNode result = (UnionNode)super.convertXmlToNode(node, xmlNamespace); 
        if (result == null) {
            return null;
        }
        result.RemoveDuplicates = Boolean.valueOf(node.getChildElement('removeDuplicates', xmlNamespace).getText());
        return result;
    }

    public override Dom.XmlNode convertNodeToXml(BaseNode node) {
        Dom.XmlNode result = super.convertNodeToXml(node);
        if (result == null) {
            return null;
        }
        UnionNode actualNode = (UnionNode)node;
        result.addChildElement('removeDuplicates', null, null).addTextNode(String.valueOf(actualNode.RemoveDuplicates));
        return result;
    }

    protected override BaseNode createNewNode() { return new UnionNode(); }

    protected override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new UnionNode();
        }
        return prototypeNode;
    }
}
