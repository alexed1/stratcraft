public with sharing class RecommendationLimitNodeXmlConverter extends BaseNodeXmlConverter {

    private RecommendationLimitNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        RecommendationLimitNode result = (RecommendationLimitNode)super.convertXmlToNode(node, xmlNamespace); 
        if (result == null) {
            return null;
        }
        result.RemoveDuplicates = Boolean.valueOf(node.getChildElement('removeDuplicates', xmlNamespace).getText());
        result.MaxRecommendationCount = Integer.valueOf(node.getChildElement('maxRecommendationCount', xmlNamespace).getText());
        result.LookbackDuration = Integer.valueOf(node.getChildElement('lookbackDuration', xmlNamespace).getText());
        for (Dom.XMLNode child : node.getChildElements()) {
            if (child.getName() == 'filterMode') {
                result.FilterModes.Add(child.getText());
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
        result.addChildElement('removeDuplicates', null, null).addTextNode(String.valueOf(actualNode.RemoveDuplicates));
        result.addChildElement('maxRecommendationCount', null, null).addTextNode(String.valueOf(actualNode.MaxRecommendationCount));
        result.addChildElement('lookbackDuration', null, null).addTextNode(String.valueOf(actualNode.LookbackDuration));
        for (String filterMode : actualNode.FilterModes) {
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
