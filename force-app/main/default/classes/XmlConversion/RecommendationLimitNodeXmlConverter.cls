public with sharing class RecommendationLimitNodeXmlConverter extends BaseNodeXmlConverter {

    private RecommendationLimitNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        RecommendationLimitNode result = (RecommendationLimitNode)super.convertXmlToNode(node, xmlNamespace); 
        if (result == null) {
            return null;
        }
        for (Dom.XMLNode child : node.getChildElements()) {
            String childName = child.getName();
            if (childName == 'filterMode') {
                result.filterModes.Add(child.getText());
            }
            else if (childName == 'removeDuplicates') {
                result.removeDuplicates = Boolean.valueOf(child.getText());
            }
            else if (childName == 'maxRecommendationCount') {
                result.maxRecommendationCount = Integer.valueOf(child.getText());
            }
            else if (childName == 'lookbackDuration') {
                result.lookbackDuration = Integer.valueOf(child.getText());
            }
        }
        return result;
    }

    protected override BaseNode createNewNode() { return new RecommendationLimitNode(); }

    public override Dom.XmlNode convertNodeToXml(BaseNode node) {
        Dom.XmlNode result = super.convertNodeToXml(node);
        if (result == null) {
            return null;
        }
        RecommendationLimitNode actualNode = (RecommendationLimitNode)node;
        result.addChildElement('removeDuplicates', null, null).addTextNode(String.valueOf(actualNode.removeDuplicates));
        result.addChildElement('maxRecommendationCount', null, null).addTextNode(String.valueOf(actualNode.maxRecommendationCount));
        result.addChildElement('lookbackDuration', null, null).addTextNode(String.valueOf(actualNode.lookbackDuration));
        for (String filterMode : actualNode.filterModes) {
            result.addChildElement('filterMode', null, null).addTextNode(filterMode);
        }
        return result;
    }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new RecommendationLimitNode();
        }
        return prototypeNode;
    }
}
