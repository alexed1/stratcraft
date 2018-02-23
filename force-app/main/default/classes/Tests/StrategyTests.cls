@isTest
public with sharing class StrategyTests {
	
	//TODO: rewrite tests

    // @isTest
	// public static void CanFindXMLNode() {
	// 	Strategy testStrategy = Fixtures.TestStrategy2();
	// 	string targetNodeName = 'RootNode';
		
	// 	Test.startTest();
	// 	StrategyNode foundNode = testStrategy.FindNodeByName(targetNodeName);
	// 	Test.stopTest();

	// 	System.assert(foundNode.name == 'RootNode', 'name not rootnode');
	// 	System.assert(foundNode.description == 'node descrip', 'description not correct');
	// }

	// @isTest
	// public static void CanPersist() {
	// 	Strategy testStrategy = Fixtures.TestStrategy1();
	
		
	// 	Test.startTest();
	// 	String result = testStrategy.Persist();
	// 	Strategy__c verificationStrategy = [SELECT name, Id FROM Strategy__c WHERE name = 'my strat'];
	// 	Test.stopTest();

	// 	System.assert(result == 'successfully persisted', 'failed to successfully persist');
	// 	System.assert(verificationStrategy.name == 'my strat', 'failed to retrieve theoretically persisted strategy');
		
	// }

	// //@isTest
	// //this test is broken. it fails to catch the exception. should figure out why
	// public static void ThrowsIfDuplicateNodeNames() {
	// 	Strategy testStrategy = Fixtures.TestStrategy2();
	// 	testStrategy.nodes.add(Fixtures.RootNode(testStrategy));
	// 	string targetNodeName = 'RootNode';
	// 	BaseException targetException;
	// 	Test.startTest();
	// 	try {
	// 		StrategyNode foundNode = testStrategy.FindNodeByName(targetNodeName);
	// 	} 
	// 	catch (BaseException e) {
	// 		targetException = e;
	// 		System.debug('in the catch loop:' + e);
	// 		return;
	// 	}
	// 	Test.stopTest();

	// 	System.assertNotEquals(null, targetException,   'expected an exception');
	// }
}
