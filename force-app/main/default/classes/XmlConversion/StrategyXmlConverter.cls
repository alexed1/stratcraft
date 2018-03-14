public with sharing class StrategyXmlConverter {
    
    private static INodeXmlConverter nodeXmlConverter = new CompositeNodeXmlConverter();

    public static string convertStrategyToXml(Strategy strategy) {
        System.debug('Started serializing strategy ' + strategy.name);
        Dom.Document document = new Dom.Document();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        Dom.XmlNode rootNode = document.createRootElement('recommendationStrategy',xmlNamespace,'');
        Dom.XmlNode name = rootNode.addChildElement('recommendationStrategyName', null,null).addTextNode(strategy.name);
        Dom.XmlNode description = rootNode.addChildElement('description', null, null).addTextNode(strategy.description == null ? '' : strategy.description);
        Dom.XmlNode masterLabel = rootNode.addChildElement('masterLabel', null, null).addTextNode(strategy.masterLabel == null ? '' : strategy.masterLabel);
        for (BaseNode childNode : strategy.nodes) {
            Dom.XmlNode xmlChildNode = nodeXmlConverter.convertNodeToXml(childNode);
            if (xmlChildNode == null) {
                System.debug(System.LoggingLevel.ERROR, 'Failed to serialize \'' + childNode.name + '\' node to XML');
            } else {
                rootNode.insertBefore(xmlChildNode, null);           
            }
        }
        System.debug('Finished serializing strategy ' + strategy.name);
        return document.toXmlString();
    }

    public static Strategy convertXmlToStrategy(string xml) {
        Dom.Document document = new Dom.Document();
        Strategy result = new Strategy();
        try {
            System.debug('Started parsing strategy XML...');
            document.load(xml);
            String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
            Dom.XMLNode strategyNode = document.getRootElement();
            for(Dom.XMLNode child : strategyNode.getChildElements()) {
                String childName = child.getName();
                if (childName == 'recommendationStrategyName') {
                    result.name = child.getText();
                }
                else if (childName == 'description') {
                    result.description = child.getText();
                }
                else if (childName == 'masterLabel') {
                    result.masterLabel = child.getText();
                }
                else if (nodeXmlConverter.canConvertXmlToNode(child, xmlNamespace)) {
                    result.nodes.add(nodeXmlConverter.convertXmlToNode(child, xmlNamespace));
                }
                else {
                    result.notification.addError('Strategy XML contains an unknown node with the name ' + childName);
                }
            }
            System.debug('Finished parsing strategy XML. Name - ' + result.name + '. Node count - ' + result.nodes.size());
            if (result.notification.hasErrors()) {
                System.debug(System.LoggingLevel.ERROR, 'The following errors occured:');
                for (String error : result.notification.errors) {
                    System.debug(error);
                }
            }
        }
        catch (Exception e) {
            result.notification.addError(e.getMessage());
            System.debug(System.LoggingLevel.ERROR, 'Failed to parse strategy XML. Error ' + e.getMessage() + '. ' + e.getStackTraceString());
        }
        return result;
    }
}
