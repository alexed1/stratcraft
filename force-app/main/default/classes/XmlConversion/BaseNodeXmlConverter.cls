public with sharing abstract class BaseNodeXmlConverter {

    public virtual BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        if (!canConvertXmlToNode(node, xmlNamespace)) {
            return null;
        }
        BaseNode result = createNewNode();
        result.Name = node.getChildElement('name', xmlNamespace).getText();
        result.Description = node.getChildElement('description', xmlNamespace).getText();
        result.ParentNodeName = node.getChildElement('parentNode', xmlNamespace).getText();
        return result;
    }

    public virtual Dom.XmlNode convertNodeToXml(BaseNode node) {
        if (!canConvertNodeToXml(node)) { 
            return null;
        }
        Dom.Document document = new Dom.Document();
        Dom.XmlNode result = document.createRootElement(node.NodeType, null, null);
        result.addChildElement('name', null, null).addTextNode(node.Name);
        result.addChildElement('description', null, null).addTextNode(node.Description);
        result.addChildElement('parentNode', null, null).addTextNode(node.ParentNodeName);
        return result;
    }

    public Boolean canConvertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        return node.getName() == getPrototypeNode().NodeType;
    }

    public Boolean canConvertNodeToXml(BaseNode node) {
        return node.NodeType == getPrototypeNode().Name;
    }

    protected abstract BaseNode createNewNode();

    protected abstract BaseNode getPrototypeNode();
}
