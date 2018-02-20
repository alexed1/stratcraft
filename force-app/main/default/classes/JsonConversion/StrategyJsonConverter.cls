public with sharing class StrategyJsonConverter {
    
    private static INodeJsonConverter nodeJsonConverter = new CompositeNodeJsonConverter();

    public static Strategy convertJsonToStrategy(String jsonString) {
        System.debug('Started deserializing strategy from JSON');
        Map<String, Object> parsedJson = (Map<String, Object>)JSON.deserializeUntyped(jsonString);
        Strategy result = new Strategy();
        result.Id = (String)parsedJson.get('id');
        result.Name = (String)parsedJson.get('name');
        result.MasterLabel = (String)parsedJson.get('masterLabel');
        result.Description = (String)parsedJson.get('description');
        for (Map<String, Object> childNodeJson : (List<Map<String, Object>>)parsedJson.get('nodes')) {
            BaseNode childNode = nodeJsonConverter.convertJsonToNode(childNodeJson);
            if (childNode != null) {
                result.Nodes.add(childNode);
            }
            else {
                result.Notification.addError('Strategy JSON contains an unknown node with the name ' + childNodeJson.get('name'));
            }
        }
        System.debug('Finished parsing strategy JSON. Name - ' + result.Name + '. Node count - ' + result.Nodes.size());
        if (result.Notification.hasErrors()) {
            System.debug(System.LoggingLevel.ERROR, 'The following errors occured:');
            for (String error : result.Notification.errors) {
                System.debug(error);
            }
        }
        return result;
    }
}
