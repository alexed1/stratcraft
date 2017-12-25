public  with sharing class Fixtures {
    public Fixtures() {

    }

    public static StrategyNode RootNode() {
		StrategyNode rootNode = new StrategyNode();
		rootNode.name='RootNode';
		rootNode.description='node descrip';
		rootNode.parentNode='none';
		rootNode.type = '2';
		rootNode.definition = '{ removeDuplicates: true }';
		return rootNode;
	}

	public static StrategyNode IfPaymentPastDueElseChurnNode() {
		StrategyNode ifNode = new StrategyNode();
		ifNode.name='IfPaymentPastDueElseChurnNode';
		ifNode.description='If payment is past due request payment else churn';
		ifNode.parentNode='RootNode';
		ifNode.type = '4';
		ifNode.definition = '{ ' +
				'expressions: {' +
					'"LoadPpd": "$Record.Contact.Payment_Due_Date__c &lt; (TODAY() - 30)",' +
					'"LowCsatIfNode": "true"},' +
				'onlyFirstMatch: true' +
			'}';
		return ifNode;
	}



	public static Strategy TestStrategy1() {
		
		Strategy testStrat = new Strategy();
		testStrat.name = 'my strat';
		//testStrat.nodes.add(fixtureIfPaymentPastDueElseChurnNode());
		testStrat.nodes.add(RootNode());

		return testStrat;

	}
}
