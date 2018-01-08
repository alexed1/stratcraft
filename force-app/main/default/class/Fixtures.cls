public  with sharing class Fixtures {
    public Fixtures() {

    }

    public static StrategyNode RootNode(Strategy parentStrategy) {
		StrategyNode rootNode = new StrategyNode();
		rootNode.name='RootNode';
		rootNode.description='node descrip';
		rootNode.parentNodeName='none';
		rootNode.type = '2';
		rootNode.definition = '{ removeDuplicates: true }';
		rootNode.parentStrategy = parentStrategy;
		return rootNode;
	}

	public static StrategyNode IfPaymentPastDueElseChurnNode(Strategy parentStrategy) {
		StrategyNode ifNode = new StrategyNode();
		ifNode.name='IfPaymentPastDueElseChurnNode';
		ifNode.description='If payment is past due request payment else churn';
		ifNode.parentNodeName='RootNode';
		ifNode.type = '4';
		ifNode.definition = '{ ' +
				'expressions: {' +
					'"LoadPpd": "$Record.Contact.Payment_Due_Date__c &lt; (TODAY() - 30)",' +
					'"LowCsatIfNode": "true"},' +
				'onlyFirstMatch: true' +
			'}';
		ifNode.parentStrategy = parentStrategy;
		return ifNode;
	}



	public static Strategy TestStrategy1() {		
		Strategy testStrat = new Strategy();
		testStrat.name = 'my strat';
		testStrat.description = 'Test Strategy description';
		testStrat.masterLabel = 'Master Label';
		testStrat.nodes.add(RootNode(testStrat));
		return testStrat;
	}

	public static Strategy TestStrategy2() {		
		Strategy testStrat = TestStrategy1();
		testStrat.nodes.add(IfPaymentPastDueElseChurnNode(testStrat));
		return testStrat;
	}

	public static string TestStrategyXML1() {
		string testNode1String = '<strategyNode><name>RootNode</name><description>the root</description>' +
		'<parentNode></parentNode><type>2<!--Union--></type><definition>{ removeDuplicates: true }</definition>' +
		'</strategyNode>';
		string testNode2String = '<strategyNode><name>ChildNode</name><description>the root</description>' +
		'<parentNode>RootNode</parentNode><type>4<!--Union--></type><definition>{foo: true }</definition>' +
		'</strategyNode>';
		string testXMLFile = '<?xml version="1.0" encoding="UTF-8"?><RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata"> ' +
    	'<description>Test Strategy</description><recommendationStrategyName>testStrat1</recommendationStrategyName> ' +
    	'<masterLabel>SomeMasterLabel</masterLabel>' + testNode1String + testNode2String + '</RecommendationStrategy>';
    	return testXMLFile;

	}

	
}
