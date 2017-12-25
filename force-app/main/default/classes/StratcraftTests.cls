@isTest
public with sharing class StratcraftTests {
    
    public StratcraftTests() {

    }

    @isTest
	public static void CanFindXMLNode() {
		Strategy testStrategy = Fixtures.TestStrategy1();
		string targetNodeName = 'RootNode';
		
		Test.startTest();
		StrategyNode foundNode = testStrategy.FindNode(targetNodeName);
		Test.stopTest();

		System.assert(foundNode.name == 'done');
	}
}
