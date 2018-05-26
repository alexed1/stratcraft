public with sharing class FixturesJson {
public static String EmptyNoIdStrategyJson =
	'{ "name" : "Name", "description" : "Description", "masterLabel" : "Master Label", "nodes" : [] }';

public static String EmptyStrategyJson =
	'{ "Id" : "Id", "name" : "Name", "description" : "Description", "masterLabel" : "Master Label", "nodes" : [] }';

public static String InvalidNodeStrategyJson =
	'{ "Id" : "Id", "name" : "Name", "description" : "Description", "masterLabel" : "Master Label", "nodes" : '
	+ '[ { "nodeType" : "unknown", "name" : "Name", "description" : "Description", "parentNodeName" : "" } ] }';

public static String UnionNodeStrategyJson =
	'{ "Id" : "Id", "name" : "Name", "description" : "Description", "masterLabel" : "Master Label", "nodes" : '
	+ '[ { "nodeType" : "union", "name" : "Name", "description" : "Description", "parentNodeName" : "", '
	+ '"removeDuplicates" : true } ] }';

public static String FilterNodeStrategyJson =
	'{ "Id" : "Id", "name" : "Name", "description" : "Description", "masterLabel" : "Master Label", "nodes" : '
	+ '[ { "nodeType" : "filter", "name" : "Name", "description" : "Description", "parentNodeName" : "", '
	+ '"removeDuplicates" : true, "expression" : "Expression" } ] }';

public static String IfNodeStrategyJson =
	'{ "Id" : "Id", "name" : "Name", "description" : "Description", "masterLabel" : "Master Label", "nodes" : '
	+ '[ { "nodeType" : "if", "name" : "Name", "description" : "Description", "parentNodeName" : "", '
	+ '"removeDuplicates" : true, "onlyFirstMatch" : true, "branches" : [ { "child" : "Child", "expression" : "Expression" }] } ] }';

public static String MutuallyExclusiveStrategyJson =
	'{ "Id" : "Id", "name" : "Name", "description" : "Description", "masterLabel" : "Master Label", "nodes" : '
	+ '[ { "nodeType" : "mutuallyExclusive", "name" : "Name", "description" : "Description", "parentNodeName" : "", '
	+ '"branches" : [ { "child" : "Child", "expression" : "" }] } ] }';

public static String RecommendationLimitNodeStrategyJson =
	'{ "Id" : "Id", "name" : "Name", "description" : "Description", "masterLabel" : "Master Label", "nodes" : '
	+ '[ { "nodeType" : "recommendationLimit", "name" : "Name", "description" : "Description", "parentNodeName" : "", '
	+ '"removeDuplicates" : true, "maxRecommendationCount" : "1", "lookbackDuration" : "2", "filterModes" : [ "Filter" ] } ] }';

public static String SoqlLoadNodeStrategyJson =
	'{ "Id" : "Id", "name" : "Name", "description" : "Description", "masterLabel" : "Master Label", "nodes" : '
	+ '[ { "nodeType" : "soqlLoad", "name" : "Name", "description" : "Description", "parentNodeName" : "", '
	+ '"soql" : "Soql", "fieldNameRemapping" : "FieldName" } ] }';
}
