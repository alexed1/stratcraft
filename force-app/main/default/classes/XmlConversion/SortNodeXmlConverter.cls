public with sharing class SortNodeXmlConverter extends BaseNodeXmlConverter{
    private SortNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        SortNode result = (SortNode)super.convertXmlToNode(node, xmlNamespace); 
        if (result == null) {
            return null;
        }
        for (Dom.XMLNode child : node.getChildElements()) {
            String childName = child.getName();
            if (childName == 'sortKey') {
                SortKey sortKey = new SortKey();
                sortKey.property = child.getChildElement('property', xmlNamespace).getText();
                sortKey.direction = child.getChildElement('direction', xmlNamespace).getText();
                result.sortKeys.Add(sortKey);
            } 
        }        
        return result;
    }

    public override Dom.XmlNode convertNodeToXml(BaseNode node) {
        Dom.XmlNode result = super.convertNodeToXml(node);
        if (result == null) {
            return null;
        }
        SortNode actualNode = (SortNode)node;
        for (SortKey sortKey : actualNode.sortKeys) {
            Dom.XmlNode sortNode = result.addChildElement('sortKey', null, null);
            sortNode.addChildElement('property', null, null).addTextNode(sortKey.property);
            sortNode.addChildElement('direction', null, null).addTextNode(sortKey.direction);
        }
        return result;
    }

    protected override BaseNode createNewNode() { return new SortNode(); }

    protected override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new SortNode();
        }
        return prototypeNode;
    }
}
