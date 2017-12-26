@isTest
public with sharing class ParseStrategyXMLTests {
	
    @isTest
	public static void ParseStrategyStringCanParseBasic() {
		
		Test.startTest();
		Strategy curStrategy = ParseStrategyXML.parseStrategyString(Fixtures.TestStrategyXML1());
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
        Strategy mockStrat = new Strategy();

		Dom.Document doc = new Dom.Document();
		doc.load(testNodeString);
		

		Test.startTest();
		StrategyNode curNode = ParseStrategyXML.parseStrategyNode(doc.getRootElement(), ns, mockStrat) ;
		Test.stopTest();

		System.assert(curNode.name == 'RootNode');
		System.assert(curNode.parentNodeName == '');
		System.debug('definition is:' + curNode.definition);
		System.assert(curNode.definition == '{ removeDuplicates: true }');
		System.assert(curNode.type == '2');
	}
	


	

}
