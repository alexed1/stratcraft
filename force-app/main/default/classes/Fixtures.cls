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
		testStrat.nodes.add(RootNode(testStrat));
		return testStrat;
	}

	public static Strategy TestStrategy2() {		
		Strategy testStrat = TestStrategy1();
		testStrat.nodes.add(IfPaymentPastDueElseChurnNode(testStrat));
		return testStrat;
	}

	
}
