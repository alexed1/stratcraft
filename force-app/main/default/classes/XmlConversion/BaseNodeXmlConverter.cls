public with sharing abstract class BaseNodeXmlConverter implements INodeXmlConverter {

protected String expressionize(String expression) {
	return expression.unescapeXml().replace('==', '=').replace('=<', '<=');
}

public virtual BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
	if (!canConvertXmlToNode(node, xmlNamespace)) {
		return null;
	}
	BaseNode result = createNewNode();
	result.name = node.getChildElement('name', xmlNamespace).getText();
	Dom.XmlNode description = node.getChildElement('description', xmlNamespace);
	if (description!=null)
		result.description = description.getText();

	Dom.XmlNode parentNode = node.getChildElement('parentNode', xmlNamespace);
	if (parentNode != null) {
		result.parentNodeName = parentNode.getText();
	} else {
		//if it doesn't return a parent node, assign it to root. this is done mainly for actionContexts
		result.parentNodeName = '';
	}

	return result;
}

public virtual Dom.XmlNode convertNodeToXml(BaseNode node) {
	if (!canConvertNodeToXml(node)) {
		return null;
	}
	Dom.Document document = new Dom.Document();
	Dom.XmlNode result = document.createRootElement(node.nodeType, null, null);
	result.addChildElement('name', null, null).addTextNode(node.name);
	result.addChildElement('description', null, null).addTextNode(node.description == null ? '' : node.description);
	result.addChildElement('parentNode', null, null).addTextNode(node.parentNodeName == null ? '' : node.parentNodeName);
	return result;
}

public Boolean canConvertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
	return node.getName() == getPrototypeNode().nodeType;
}

public Boolean canConvertNodeToXml(BaseNode node) {
	return node.nodeType == getPrototypeNode().nodeType;
}

protected abstract BaseNode createNewNode();

protected abstract BaseNode getPrototypeNode();
}
