public with sharing class IfNodeXmlConverter extends BaseNodeXmlConverter {
    
    private IfNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        IfNode result = (IfNode)super.convertXmlToNode(node, xmlNamespace); 
        if (result == null) {
            return null;
        }
        result.removeDuplicates = Boolean.valueOf(node.getChildElement('removeDuplicates', xmlNamespace).getText());
        result.onlyFirstMatch = Boolean.valueOf(node.getChildElement('onlyFirstMatch', xmlNamespace).getText());
        for (Dom.XMLNode child : node.getChildElements()) {
            if (child.getName() == 'branch') {
                IfBranch branch = new IfBranch();
                branch.child = child.getChildElement('child', xmlNamespace).getText();
                branch.expression = child.getChildElement('expression', xmlNamespace).getText();
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
        IfNode actualNode = (IfNode)node;
        result.addChildElement('removeDuplicates', null, null).addTextNode(String.valueOf(actualNode.removeDuplicates));
        result.addChildElement('onlyFirstMatch', null, null).addTextNode(String.valueOf(actualNode.onlyFirstMatch));
        for (IfBranch branch : actualNode.branches) {
            Dom.XmlNode branchNode = result.addChildElement('branch', null, null);
            branchNode.addChildElement('child', null, null).addTextNode(branch.child);
            branchNode.addChildElement('expression', null, null).addTextNode(branch.expression);
        }
        return result;
    }

    protected override BaseNode createNewNode() { return new IfNode(); }

    protected override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new IfNode();
        }
        return prototypeNode;
    }
}
