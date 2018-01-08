@isTest
public with sharing class StrategyNodeTests {
    public StrategyNodeTests() {

    }

    @isTest
	public static void CanFindChildNodes() {
		Strategy testStrategy = Fixtures.TestStrategy2();
		StrategyNode startNode = testStrategy.FindNodeByName('RootNode');

		Test.startTest();
		List<StrategyNode> childNodes = startNode.FindChildNodes();
		Test.stopTest();

		System.assertEquals(childNodes.size(), 1 , 'did not fine exactly 1 child node of the root node');
		
	}
}
