public with sharing class StrategyJsonConverter {
    
    private static INodeJsonConverter nodeJsonConverter = new CompositeNodeJsonConverter();

    public static Strategy convertJsonToStrategy(String jsonString) {
        System.debug('Started deserializing strategy from JSON');
        Map<String, Object> parsedJson = (Map<String,Object>)JSON.deserializeUntyped(jsonString);
        Strategy result = new Strategy();
        result.Id = (String)parsedJson.get('Id');
        result.name = (String)parsedJson.get('name');
        result.masterLabel = (String)parsedJson.get('masterLabel');
        result.description = (String)parsedJson.get('description');
        for (Object childNodeJsonObj : (List<Object>)parsedJson.get('nodes')) {
            Map<String, Object> childNodeJson = (Map<String, Object>)childNodeJsonObj;
            BaseNode childNode = nodeJsonConverter.convertJsonToNode(childNodeJson);
            if (childNode != null) {
                result.nodes.add(childNode);
            }
            else {
                result.notification.addError('Strategy JSON contains an unknown node with the name ' + childNodeJson.get('name'));
            }
        }
        System.debug('Finished parsing strategy JSON. Name - ' + result.name + '. Node count - ' + result.nodes.size());
        if (result.notification.hasErrors()) {
            System.debug(System.LoggingLevel.ERROR, 'The following errors occured:');
            for (String error : result.notification.errors) {
                System.debug(error);
            }
        }
        return result;
    }
}
