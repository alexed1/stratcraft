public with sharing class FixturesXml {

public static String InvalidStrategyXml = '<RecommendationStrategy /';

public static String EmptyStrategyXml =
	'<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
	+ '<description>Description</description>'
	+ '<label>label</label>'
	+ '<name>Name</name>'
	+ '</RecommendationStrategy>';

public static String SpecialSymbolsStrategyXml =
	'<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
	+ '<description>&lt;&gt;&amp;&quot;&apos;</description>'
	+ '<label>&lt;&gt;&amp;&quot;&apos;</label>'
	+ '<name>&lt;&gt;&amp;&quot;&apos;</name>'
	+ '</RecommendationStrategy>';

public static String UnionNodeStrategyXml =
	'<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
	+ '<union>'
	+ '<name>RootNode</name>'
	+ '<description>Description</description>'
	+ '<parentNode />'
	+ '<removeDuplicates>true</removeDuplicates>'
	+ '</union>'
	+ '</RecommendationStrategy>';

public static String FilterNodeStrategyXml =
	'<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
	+ '<filter>'
	+ '<name>RootNode</name>'
	+ '<description>Description</description>'
	+ '<parentNode />'
	+ '<removeDuplicates>true</removeDuplicates>'
	+ '<expression>Expression</expression>'
	+ '</filter>'
	+ '</RecommendationStrategy>';

public static String IfNodeStrategyXml =
	'<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
	+ '<if>'
	+ '<name>RootNode</name>'
	+ '<description>Description</description>'
	+ '<parentNode />'
	+ '<removeDuplicates>true</removeDuplicates>'
	+ '<onlyFirstMatch>true</onlyFirstMatch>'
	+ '<branch>'
	+ '<child>Child</child>'
	+ '<expression>Expression</expression>'
	+ '</branch>'
	+ '</if>'
	+ '</RecommendationStrategy>';

public static String RecommendationLimitNodeStrategyXml =
	'<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
	+ '<recommendationLimit>'
	+ '<name>RootNode</name>'
	+ '<description>Description</description>'
	+ '<parentNode />'
	+ '<removeDuplicates>true</removeDuplicates>'
	+ '<filterMode>Filter</filterMode>'
	+ '<maxRecommendationCount>1</maxRecommendationCount>'
	+ '<lookbackDuration>2</lookbackDuration>'
	+ '</recommendationLimit>'
	+ '</RecommendationStrategy>';

public static String SoqlLoadNodeStrategyXml =
	'<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
	+ '<soqlLoad>'
	+ '<name>RootNode</name>'
	+ '<description>Description</description>'
	+ '<parentNode />'
	+ '<soql>SOQL</soql>'
	+ '<fieldNameRemapping>FieldName</fieldNameRemapping>'
	+ '</soqlLoad>'
	+ '</RecommendationStrategy>';

public static String MutuallyExclusiveStrategyXml =
	'<?xml version="1.0" encoding="UTF-8"?>'+
	'<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'+
	'   <description>Mutually exclusive node example</description>'+
	'   <label>MutuallyExclusiveNode</label>'+
	'   <name>MutuallyExclusiveNode</name>'+
	'   <mutuallyExclusive>'+
	'       <description>Mutually Exclusive Node</description>'+
	'       <name>RootNode</name>'+
	'       <parentNode xsi:nil="true"/>'+
	'       <branch>LoadProposition1</branch>'+
	'       <branch>LoadProposition2</branch>'+
	'   </mutuallyExclusive>'+
	'</RecommendationStrategy>';
}
