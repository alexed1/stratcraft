public with sharing class FixturesStrategy {
public static Strategy NoNodesStrategy() {
	Strategy result = new Strategy();
	result.name = 'Name';
	result.description = 'Description';
	result.masterLabel = 'Master Label';
	return result;
}

public static Strategy SpecialSymbolsStrategy() {
	Strategy result = new Strategy();
	result.name = '<>&"\'';
	result.description = '<>&"\'';
	result.masterLabel = '<>&"\'';
	return result;
}

public static Strategy UnionNodeStrategy() {
	Strategy result = NoNodesStrategy();
	UnionNode node = new UnionNode();
	node.name = 'Name';
	node.description = 'Description';
	node.removeDuplicates = true;
	result.nodes.add(node);
	return result;
}

public static Strategy FilterNodeStrategy() {
	Strategy result = NoNodesStrategy();
	FilterNode node = new FilterNode();
	node.name = 'Name';
	node.description = 'Description';
	node.removeDuplicates = true;
	node.expression = 'Expression';
	result.nodes.add(node);
	return result;
}

public static Strategy IfNodeStrategy() {
	Strategy result = NoNodesStrategy();
	IfNode node = new IfNode();
	node.name = 'Name';
	node.description = 'Description';
	node.removeDuplicates = true;
	node.onlyFirstMatch = true;
	IfBranch branch = new IfBranch();
	branch.child = 'Child';
	branch.expression = 'Expression';
	node.branches.add(branch);
	result.nodes.add(node);
	return result;
}

public static Strategy MutuallyExclusiveStrategy() {
	Strategy result = NoNodesStrategy();
	MutuallyExclusiveNode node = new MutuallyExclusiveNode();
	node.name = 'Name';
	node.description = 'Description';
	IfBranch branch = new IfBranch();
	branch.child = 'Child';
	node.branches.add(branch);
	result.nodes.add(node);
	return result;
}

public static Strategy RecommendationLimitStrategy() {
	Strategy result = NoNodesStrategy();
	RecommendationLimitNode node = new RecommendationLimitNode();
	node.name = 'Name';
	node.description = 'Description';
	node.removeDuplicates = true;
	node.lookbackDuration = 1;
	node.maxRecommendationCount = 2;
	node.filterModes.add('Filter Mode');
	result.nodes.add(node);
	return result;
}

public static Strategy SoqlLoadStrategy() {
	Strategy result = NoNodesStrategy();
	SoqlLoadNode node = new SoqlLoadNode();
	node.name = 'Name';
	node.description = 'Description';
	node.soql = 'Soql';
	node.fieldNameRemapping = 'Field Name Remapping';
	result.nodes.add(node);
	return result;
}
}
