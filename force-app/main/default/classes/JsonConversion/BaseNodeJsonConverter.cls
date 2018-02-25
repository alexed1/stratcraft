public with sharing abstract class BaseNodeJsonConverter implements INodeJsonConverter {
    
    public virtual BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        if (!canConvertJsonToNode(jsonNode)) {
            return null;
        }
        BaseNode result = createNewNode();
        result.name = (String)jsonNode.get('name');
        result.description = (String)jsonNode.get('description');
        result.parentNodeName = (String)jsonNode.get('parentNodeName');
        return result;
    }

    public Boolean canConvertJsonToNode(Map<String, Object> jsonNode) {
        return (String)jsonNode.get('nodeType') == getPrototypeNode().nodeType;
    }

    protected abstract BaseNode createNewNode();

    protected abstract BaseNode getPrototypeNode();
}
