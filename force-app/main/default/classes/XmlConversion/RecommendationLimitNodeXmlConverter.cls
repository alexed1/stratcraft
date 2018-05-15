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
                String filterMode = child.getText();
                result.filterModes.Add(filterMode == null ? '' : filterMode);
            }
            else if (childName == 'removeDuplicates') {
                result.removeDuplicates = Boolean.valueOf(child.getText());
            }
            else if (childName == 'maxRecommendationCount') {
                String maxCount = child.getText();
                result.maxRecommendationCount = String.isBlank(maxCount) ? 0 : Integer.valueOf(maxCount);
            }
            else if (childName == 'lookbackDuration') {
                String lookback = child.getText();
                result.lookbackDuration = String.isBlank(lookback) ? 0 : Integer.valueOf(lookback);
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
        if (actualNode.filterModes != null) {
            for (String filterMode : actualNode.filterModes) {
                if (String.isBlank(filterMode)) {
                    continue;
                }
                result.addChildElement('filterMode', null, null).addTextNode(filterMode);
            }
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
