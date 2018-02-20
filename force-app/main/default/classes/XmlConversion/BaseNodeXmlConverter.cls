public with sharing abstract class BaseNodeXmlConverter {

    public virtual BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        if (!canConvertXmlToNode(node, xmlNamespace)) {
            return null;
        }
        BaseNode result = createNewNode();
        result.name = node.getChildElement('name', xmlNamespace).getText();
        result.description = node.getChildElement('description', xmlNamespace).getText();
        result.parentNodeName = node.getChildElement('parentNode', xmlNamespace).getText();
        return result;
    }

    public virtual Dom.XmlNode convertNodeToXml(BaseNode node) {
        if (!canConvertNodeToXml(node)) { 
            return null;
        }
        Dom.Document document = new Dom.Document();
        Dom.XmlNode result = document.createRootElement(node.nodeType, null, null);
        result.addChildElement('name', null, null).addTextNode(node.name);
        result.addChildElement('description', null, null).addTextNode(node.description);
        result.addChildElement('parentNode', null, null).addTextNode(node.parentNodeName);
        return result;
    }

    public Boolean canConvertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        return node.getName() == getPrototypeNode().nodeType;
    }

    public Boolean canConvertNodeToXml(BaseNode node) {
        return node.nodeType == getPrototypeNode().name;
    }

    protected abstract BaseNode createNewNode();

    protected abstract BaseNode getPrototypeNode();
}
