public with sharing class SoqlLoadNodeXmlConverter extends BaseNodeXmlConverter {
    
    private SoqlLoadNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        SoqlLoadNode result = (SoqlLoadNode)super.convertXmlToNode(node, xmlNamespace); 
        if (result == null) {
            return null;
        }
        result.soql = node.getChildElement('soql', xmlNamespace).getText();
        Dom.XmlNode fieldNameRemappingNode = node.getChildElement('fieldNameRemapping', xmlNamespace);
        result.fieldNameRemapping = fieldNameRemappingNode == null ? '' : fieldNameRemappingNode.getText();
        return result;
    }

    protected override BaseNode createNewNode() { return new SoqlLoadNode(); }

    public override Dom.XmlNode convertNodeToXml(BaseNode node) {
        Dom.XmlNode result = super.convertNodeToXml(node);
        if (result == null) {
            return null;
        }
        SoqlLoadNode actualNode = (SoqlLoadNode)node;
        result.addChildElement('soql', null, null).addTextNode(actualNode.Soql);
        if (!String.isBlank(actualNode.fieldNameRemapping)) {
            result.addChildElement('fieldNameRemapping', null, null).addTextNode(actualNode.fieldNameRemapping);
        }
        return result;
    }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new SoqlLoadNode();
        }
        return prototypeNode;
    }
}
