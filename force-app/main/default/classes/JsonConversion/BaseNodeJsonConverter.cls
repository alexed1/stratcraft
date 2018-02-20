public with sharing abstract class BaseNodeJsonConverter implements INodeJsonConverter {
    
    public virtual BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        if (!canConvertJsonToNode(jsonNode)) {
            return null;
        }
        BaseNode result = createNewNode();
        result.Name = (String)jsonNode.get('name');
        result.Description = (String)jsonNode.get('description');
        result.ParentNodeName = (String)jsonNode.get('parentNode');
        return result;
    }

    public Boolean canConvertJsonToNode(Map<String, Object> jsonNode) {
        return (String)jsonNode.get('nodeType') == getPrototypeNode().NodeType;
    }

    protected abstract BaseNode createNewNode();

    protected abstract BaseNode getPrototypeNode();
}
