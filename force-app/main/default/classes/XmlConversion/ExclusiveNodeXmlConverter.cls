public with sharing class ExclusiveNodeXmlConverter extends BaseNodeXmlConverter {

private MutuallyExclusiveNode prototypeNode;

public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
	MutuallyExclusiveNode result = (MutuallyExclusiveNode) super.convertXmlToNode(node, xmlNamespace);
	if (result == null) {
		return null;
	}
	for (Dom.XMLNode child : node.getChildElements()) {
		String childName = child.getName();

		if (childName == 'branch') {
			IfBranch branch = new IfBranch();
			String childBranch = child.getText();
			branch.child = childBranch == null ? '' : childBranch;
			result.branches.Add(branch);
		}
	}
	return result;
}

public override Dom.XmlNode convertNodeToXml(BaseNode node) {
	Dom.XmlNode result = super.convertNodeToXml(node);
	if (result == null) {
		return null;
	}
	MutuallyExclusiveNode actualNode = (MutuallyExclusiveNode)node;

	for (IfBranch branch : actualNode.branches) {
		if (branch.child != null && branch.child != '')
			result.addChildElement('branch', null, null).addTextNode(branch.child);
	}
	return result;
}

protected override BaseNode createNewNode() {
	return new MutuallyExclusiveNode();
}

protected override BaseNode getPrototypeNode() {
	if (prototypeNode == null) {
		prototypeNode = new MutuallyExclusiveNode();
	}
	return prototypeNode;
}
}
