public with sharing class ExternalConnectionNodeJsonConverter extends BaseNodeJsonConverter {
    
    private ExternalConnectionNode prototypeNode;

    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        ExternalConnectionNode result = (ExternalConnectionNode)super.convertJsonToNode(jsonNode); 
        if (result == null) {
            return null;
        }
       
        result.type = jsonNode.containsKey('type') ? (String)jsonNode.get('type') : '';
        result.action = jsonNode.containsKey('action') ? (String)jsonNode.get('action') : '';
    
        
        if (jsonNode.containsKey('argPairs')) {
            for (Object childObj : (List<Object>)jsonNode.get('argPairs')) {
                Map<String, Object> child = (Map<String, Object>)childObj;
                ArgumentPair argumentPair = new ArgumentPair();
                argumentPair.name = (String)child.get('name');
                argumentPair.value = (String)child.get('value');
                result.argPairs.Add(argumentPair);
            }
        }        
        System.debug('in convertJsonToNode for external, result node is: '+ result);

        return result;
    }

    protected override BaseNode createNewNode() { return new ExternalConnectionNode(); }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new ExternalConnectionNode();
        }
        return prototypeNode;
    }
}
