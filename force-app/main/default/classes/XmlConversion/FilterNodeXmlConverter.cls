public with sharing class FilterNodeXmlConverter extends BaseNodeXmlConverter {

    private FilterNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        FilterNode result = (FilterNode)super.convertXmlToNode(node, xmlNamespace);
        if (result == null) {
            return null;
        }
        for (Dom.XmlNode child : node.getChildElements()) {
            String childName = child.getName();
            if (childName == 'removeDuplicates') {
                result.removeDuplicates = Boolean.valueOf(child.getText());
            } else if (childName == 'expression') {
                result.expression = child.getText();
            }
        }
        return result;
    }

    protected override BaseNode createNewNode() { return new FilterNode(); }

    public override Dom.XmlNode convertNodeToXml(BaseNode node) {
        Dom.XmlNode result = super.convertNodeToXml(node);
        if (result == null) {
            return null;
        }
        FilterNode actualNode = (FilterNode)node;
        result.addChildElement('removeDuplicates', null, null).addTextNode(String.valueOf(actualNode.removeDuplicates));
        result.addChildElement('expression', null, null).addTextNode(actualNode.expression);
        return result;
    }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new FilterNode();
        }
        return prototypeNode;
    }
}
