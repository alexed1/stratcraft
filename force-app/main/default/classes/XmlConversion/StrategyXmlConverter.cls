public with sharing class StrategyXmlConverter {
    
    private static INodeXmlConverter nodeXmlConverter = new CompositeNodeXmlConverter();

    public static string convertStrategyToXml(Strategy strategy) {
        System.debug('Started serializing strategy ' + strategy.Name);
        Dom.Document document = new Dom.Document();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        Dom.XmlNode rootNode = document.createRootElement('recommendationStrategy',xmlNamespace,'');
        Dom.XmlNode name = rootNode.addChildElement('recommendationStrategyName', null,null).addTextNode(strategy.Name);
        Dom.XmlNode description = rootNode.addChildElement('description', null, null).addTextNode(strategy.Description);
        Dom.XmlNode masterLabel = rootNode.addChildElement('masterLabel', null, null).addTextNode(strategy.MasterLabel);
        for (BaseNode childNode : strategy.Nodes) {
            Dom.XmlNode xmlChildNode = nodeXmlConverter.convertNodeToXml(childNode);
            if (xmlChildNode == null) {
                System.debug(System.LoggingLevel.ERROR, 'Failed to serialize \'' + childNode.Name + '\' node to XML');
            } else {
                rootNode.insertBefore(xmlChildNode, null);
            }
        }
        System.debug('Finished serializing strategy ' + strategy.Name);
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
            result.Name = strategyNode.getChildElement('recommendationStrategyName', xmlNamespace).getText();
            result.Description = strategyNode.getChildElement('description', xmlNamespace).getText();
            result.MasterLabel = strategyNode.getChildElement('masterLabel', xmlNamespace).getText();
            for(Dom.XMLNode child : strategyNode.getChildElements()) {
                String childName = child.getName();
                if (childName == 'recommendationStrategyName') {
                    result.Name = child.getText();
                }
                else if (childName == 'description') {
                    result.Description = child.getText();
                }
                else if (childName == 'masterLabel') {
                    result.MasterLabel = child.getText();
                }
                else if (nodeXmlConverter.canConvertXmlToNode(child, xmlNamespace)) {
                    result.Nodes.add(nodeXmlConverter.convertXmlToNode(child, xmlNamespace));
                }
                else {
                    result.Notification.addError('Strategy XML contains an unknown node with the name ' + childName);
                }
            }
            System.debug('Finished parsing strategy XML. Name - ' + result.Name + '. Node count - ' + result.Nodes.size());
            if (result.Notification.hasErrors()) {
                System.debug(System.LoggingLevel.ERROR, 'The following errors occured:');
                for (String error : result.Notification.errors) {
                    System.debug(error);
                }
            }
        }
        catch (Exception e) {
            result.Notification.addError(e.getMessage());
            System.debug(System.LoggingLevel.ERROR, 'Failed to parse strategy XML. Error ' + e);
        }
        return result;
    }
}
