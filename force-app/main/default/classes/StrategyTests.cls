@isTest
public with sharing class StrategyTests {
    
    public StrategyTests() {

    }

    public class BaseException extends Exception {}

    @isTest
	public static void CanFindXMLNode() {
		Strategy testStrategy = Fixtures.TestStrategy2();
		string targetNodeName = 'RootNode';
		
		Test.startTest();
		StrategyNode foundNode = testStrategy.FindNodeByName(targetNodeName);
		Test.stopTest();

		System.assert(foundNode.name == 'RootNode', 'name not rootnode');
		System.assert(foundNode.description == 'node descrip', 'description not correct');
	}

	//@isTest
	//this test is broken. it fails to catch the exception. should figure out why
	public static void ThrowsIfDuplicateNodeNames() {
		Strategy testStrategy = Fixtures.TestStrategy2();
		testStrategy.nodes.add(Fixtures.RootNode(testStrategy));
		string targetNodeName = 'RootNode';
		BaseException targetException;
		Test.startTest();
		try {
			StrategyNode foundNode = testStrategy.FindNodeByName(targetNodeName);
		} 
		catch (BaseException e) {
			targetException = e;
			System.debug('in the catch loop:' + e);
			return;
		}
		Test.stopTest();

		System.assertNotEquals(null, targetException,   'expected an exception');
	}
}
