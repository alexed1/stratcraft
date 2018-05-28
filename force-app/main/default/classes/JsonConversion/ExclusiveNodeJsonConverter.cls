public with sharing class ExclusiveNodeJsonConverter extends BaseNodeJsonConverter {

private MutuallyExclusiveNode prototypeNode;

public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
	MutuallyExclusiveNode result = (MutuallyExclusiveNode) super.convertJsonToNode(jsonNode);
	if (result == null) {
		return null;
	}

	if (jsonNode.containsKey('branches')) {
		for (Object childObj : (List<Object>)jsonNode.get('branches')) {
			Map<String, Object> child = (Map<String, Object>)childObj;
			IfBranch branch = new IfBranch();
			branch.child = (String)child.get('child');
			result.branches.Add(branch);
		}
	}
	return result;
}

protected override BaseNode createNewNode() {
	return new MutuallyExclusiveNode();
}

protected override BaseNode getPrototypeNode() {
	if (prototypeNode == null) {
		prototypeNode = new MutuallyExclusiveNode();
	}
	return prototypeNode;
}
}
