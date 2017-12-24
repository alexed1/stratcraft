@isTest
public with sharing class BuildTreeTests {
	
    @isTest
	public static void CanBuildTree() {
		Stratcraft.Strategy testStrategy = fixtureTestStrategy1();
		
		Test.startTest();
		string treeString = BuildTree.Assemble(testStrategy);
		Test.stopTest();

		System.assert(treeString == 'done');
	
	}

	@isTest
	public static void CanBuildTreeItem() {
		Stratcraft.Strategy testStrategy = fixtureTestStrategy1();
		string curNodeName = 'RootNode';
		
		Test.startTest();
		BuildTree.TreeNode treeNode = BuildTree.BuildTreeItem(testStrategy, curNodeName);
		Test.stopTest();

		System.assert(treeNode.label = 'done');
	
	}

	static Stratcraft.StrategyNode fixtureRootNode() {
		Stratcraft.StrategyNode rootNode = new Stratcraft.StrategyNode();
		rootNode.name='RootNode';
		rootNode.description='node descrip';
		rootNode.parentNode='none';
		rootNode.type = '2';
		rootNode.definition = '{ removeDuplicates: true }';
		return rootNode;
	}

	static Stratcraft.StrategyNode fixtureIfPaymentPastDueElseChurnNode() {
		Stratcraft.StrategyNode ifNode = new Stratcraft.StrategyNode();
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



	static Stratcraft.Strategy fixtureTestStrategy1() {
		
		Stratcraft.Strategy testStrat = new Stratcraft.Strategy();
		testStrat.name = 'my strat';
		//testStrat.nodes.add(fixtureIfPaymentPastDueElseChurnNode());
		testStrat.nodes.add(fixtureRootNode());

		return testStrat;

	}
    




}
