@isTest
public with sharing class ParseStrategyXMLTests {
	
    @isTest
	public static void ParseStrategyStringCanParseBasic() {
		string testNode1String = '<strategyNode><name>RootNode</name><description>the root</description>' +
		'<parentNode></parentNode><type>2<!--Union--></type><definition>{ removeDuplicates: true }</definition>' +
		'</strategyNode>';
		string testNode2String = '<strategyNode><name>ChildNode</name><description>the root</description>' +
		'<parentNode>RootNode</parentNode><type>4<!--Union--></type><definition>{foo: true }</definition>' +
		'</strategyNode>';
		string testXMLFile = '<?xml version="1.0" encoding="UTF-8"?><RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata"> ' +
    	'<description>Test Strategy</description><recommendationStrategyName>testStrat1</recommendationStrategyName> ' +
    	'<masterLabel>SomeMasterLabel</masterLabel>' + testNode1String + testNode2String + '</RecommendationStrategy>';

		Test.startTest();
		ParseStrategyXML.Strategy curStrategy = ParseStrategyXML.parseStrategyString(testXMLFile);
		Test.stopTest();

		System.assert(curStrategy.name == 'testStrat1');
		System.assert(curStrategy.nodes.size() == 2);
		System.assert(curStrategy.nodes[0].name == 'RootNode');
		System.assert(curStrategy.nodes[1].definition == '{foo: true }');	
	}
    

	@isTest
	public static void ParseStrategyNodeCanParseBasic() {

		string testNodeString = '<strategyNode><name>RootNode</name><description>the root</description>' +
		'<parentNode></parentNode><type>2<!--Union--></type><definition>{ removeDuplicates: true }</definition>' +
		'</strategyNode>';
		//namespace
        string ns = null;

		Dom.Document doc = new Dom.Document();
		System.debug('doc is:' + doc);
		doc.load(testNodeString);
		System.debug('doc is now:' + doc);

		Test.startTest();
		ParseStrategyXML.StrategyNode curNode = ParseStrategyXML.parseStrategyNode(doc.getRootElement(), ns);
		Test.stopTest();

		System.assert(curNode.name == 'RootNode');
		System.assert(curNode.parentNode == '');
		System.debug('definition is:' + curNode.definition);
		System.assert(curNode.definition == '{ removeDuplicates: true }');

	}



}
