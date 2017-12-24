@isTest
public with sharing class BuildTreeTests {
	
    @isTest
	public static void CanBuildTree() {
		Stratcraft.Strategy testStrategy = new Stratcraft.Strategy();
		
		Test.startTest();
		string treeString = BuildTree.assemble(testStrategy);
		Test.stopTest();

		System.assert(treeString == 'done');
	
	}
    




}
