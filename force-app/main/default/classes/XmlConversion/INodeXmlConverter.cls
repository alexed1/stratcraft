public interface INodeXmlConverter {

    Boolean canConvertXmlToNode(Dom.XmlNode node, String xmlNamespace);

    BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace);

    Dom.XmlNode convertNodeToXml(BaseNode node);

    Boolean canConvertNodeToXml(BaseNode node);
}
