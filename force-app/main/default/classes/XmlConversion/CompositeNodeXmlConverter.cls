public with sharing class CompositeNodeXmlConverter implements INodeXmlConverter {
    
    private List<INodeXmlConverter> converters;

    public CompositeNodeXmlConverter() {
        converters = new List<INodeXmlConverter>();
        converters.add(new SoqlLoadNodeXmlConverter());
        converters.add(new UnionNodeXmlConverter());
        converters.add(new IfNodeXmlConverter());
        converters.add(new FilterNodeXmlConverter());
        converters.add(new RecommendationLimitNodeXmlConverter());
    }

    public Boolean canConvertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        for (INodeXmlConverter converter : converters) {
            if (converter.canConvertXmlToNode(node, xmlNamespace)) {
                return true;
            }
        }
        return false;
    }

    public BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        for (INodeXmlConverter converter : converters) {
            if (converter.canConvertXmlToNode(node, xmlNamespace)) {
                return converter.convertXmlToNode(node, xmlNamespace);
            }
        }
        return null;
    }

    public Dom.XmlNode convertNodeToXml(BaseNode node) {
        for (INodeXmlConverter converter : converters) {
            if (converter.canConvertNodeToXml(node)) {
                return converter.convertNodeToXml(node);
            }
        }
        return null;
    }

    public Boolean canConvertNodeToXml(BaseNode node) {
         for (INodeXmlConverter converter : converters) {
            if (converter.canConvertNodeToXml(node)) {
                return true;
            }
        }
        return false;
    }
}
