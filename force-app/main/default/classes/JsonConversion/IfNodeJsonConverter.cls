public with sharing class IfNodeJsonConverter extends BaseNodeJsonConverter {
    
    private IfNode prototypeNode;

    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        IfNode result = (IfNode)super.convertJsonToNode(jsonNode); 
        if (result == null) {
            return null;
        }
        result.removeDuplicates = jsonNode.containsKey('removeDuplicates') ? (Boolean)jsonNode.get('removeDuplicates') : false;
        result.onlyFirstMatch = jsonNode.containsKey('onlyFirstMatch') ? (Boolean)jsonNode.get('onlyFirstMatch') : false;
        if (jsonNode.containsKey('branches')) {
            for (Object childObj : (List<Object>)jsonNode.get('branches')) {
                Map<String, Object> child = (Map<String, Object>)childObj;
                IfBranch branch = new IfBranch();
                branch.child = (String)child.get('child');
                branch.expression = (String)child.get('expression');
                result.branches.Add(branch);
            }
        }        
        return result;
    }

    protected override BaseNode createNewNode() { return new IfNode(); }

    protected override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new IfNode();
        }
        return prototypeNode;
    }
}
