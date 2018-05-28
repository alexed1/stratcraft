@isTest
public with sharing class StrategyJsonConverterTests {

@isTest
public static void convertJsonToStrategy_WhenJsonDoesntContainChildNodes_StrategyPropertiesAreSet() {
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(FixturesJson.EmptyStrategyJson);
	System.assertEquals('Name', strategy.name, 'Name mismatches');
	System.assertEquals('Description', strategy.description, 'Description mismatches');
	System.assertEquals('Master Label', strategy.masterLabel, 'Master label mismatches');
	System.assertEquals(0, strategy.nodes.size(), 'Empty strategy must not contain any node');
}

@isTest
public static void convertJsonToStrategy_WhenUnkonwnNodeIsFound_ReportsError() {
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(FixturesJson.InvalidNodeStrategyJson);
	System.assertEquals(1, strategy.notification.errors.size(), 'Strategy with unknown node type must contain an error');
	System.assertEquals('Strategy JSON contains an unknown node with the name Name and node type unknown',
	                    strategy.notification.errors[0],
	                    'Error text mismatches');
}

@isTest
public static void convertJsonToStrategy_WhenJsonContainsNode_NodePropertiesAreSet() {
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(FixturesJson.UnionNodeStrategyJson);
	System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain only one node');
	BaseNode node = strategy.nodes[0];
	System.assertEquals('Name', node.name, 'Name mismatches');
	System.assertEquals('Description', node.description, 'Description mismatches');
	System.assertEquals('', node.parentNodeName, 'Parent node name for root node must be null');
}

@isTest
public static void convertJsonToStrategy_WhenJsonContainsFilterNodes_NodePropertiesAreSet() {
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(FixturesJson.FilterNodeStrategyJson);
	System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one nodes');
	FilterNode node = (FilterNode)strategy.nodes[0];
	System.assert (node.removeDuplicates, '"Remove duplicates" field value mismatches');
	System.assertEquals('Expression', node.expression, '"Expression" field value mismatches');
}

@isTest
public static void convertJsonToStrategy_WhenJsonContainsIfNodes_NodePropertiesAreSet() {
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(FixturesJson.IfNodeStrategyJson);
	System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one nodes');
	IfNode node = (IfNode)strategy.nodes[0];
	System.assert (node.removeDuplicates, '"Remove duplicates" field value mismatches');
	System.assert (node.onlyFirstMatch, '"Only first match" field value mismatches');
	System.assertEquals(1, node.branches.size(), 'Node must contain one branch');
	IfBranch branch = node.branches[0];
	System.assertEquals('Child', branch.child, 'Branch "Child" field value mismatches');
	System.assertEquals('Expression', branch.expression, 'Branch "Expression" field value mismatches');
}

@isTest
public static void convertJsonToStrategy_WhenJsonContainsMutuallyExclusive_NodePropertiesAreSet() {
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(FixturesJson.MutuallyExclusiveStrategyJson);
	System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one nodes');
	MutuallyExclusiveNode node = (MutuallyExclusiveNode)strategy.nodes[0];
	System.assertEquals(1, node.branches.size(), 'Node must contain one branch');
	IfBranch branch = node.branches[0];
	System.assertEquals('Child', branch.child, 'Branch "Child" field value mismatches');
}

@isTest
public static void convertJsonToStrategy_WhenJsonContainsRecommendationLimitNodes_NodePropertiesAreSet() {
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(FixturesJson.RecommendationLimitNodeStrategyJson);
	System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one nodes');
	RecommendationLimitNode node = (RecommendationLimitNode)strategy.nodes[0];
	System.assert (node.removeDuplicates, '"Remove duplicates" field value mismatches');
	System.assertEquals(1, node.filterModes.size(), 'Node must contain one filter mode');
	System.assertEquals('Filter', node.filterModes[0], 'Filter mode mistmatches');
	System.assertEquals(1, node.maxRecommendationCount, '"Max recommendation count" field value mistmatches');
	System.assertEquals(2, node.lookbackDuration, '"Lookback duration" field value mistmatches');
}

@isTest
public static void convertJsonToStrategy_WhenJsonContainsSoqlLoadNode_NodePropertiesAreSet() {
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(FixturesJson.SoqlLoadNodeStrategyJson);
	System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain only one node');
	SoqlLoadNode node = (SoqlLoadNode)strategy.nodes[0];
	System.assertEquals('Soql', node.soql, '"SOQL" field value mismatches');
	System.assertEquals('FieldName', node.fieldNameRemapping, '"Field name remapping" field value mismatches');
}

@isTest
public static void convertJsonToStrategy_WhenJsonContainsUnionNodes_NodePropertiesAreSet() {
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(FixturesJson.UnionNodeStrategyJson);
	System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one node');
	UnionNode node = (UnionNode)strategy.nodes[0];
	System.assert (node.removeDuplicates, '"Remove duplicates" field value mismatches');
}
}
