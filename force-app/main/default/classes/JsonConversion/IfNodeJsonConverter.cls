public with sharing class IfNodeJsonConverter extends BaseNodeJsonConverter {
    
    private IfNode prototypeNode;

    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        IfNode result = (IfNode)super.convertJsonToNode(jsonNode); 
        if (result == null) {
            return null;
        }
        result.removeDuplicates = (Boolean)jsonNode.get('removeDuplicates');
        result.onlyFirstMatch = (Boolean)jsonNode.get('onlyFirstMatch');
        for (Map<String, Object> child : (List<Map<String, Object>>)jsonNode.get('branches')) {
            IfBranch branch = new IfBranch();
            branch.child = (String)child.get('child');
            branch.expression = (String)child.get('expression');
            result.branches.Add(branch);
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
