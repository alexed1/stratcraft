@isTest
public with sharing class BuildTreeTests {
	
    @isTest
	public static void CanBuildTree() {
		Strategy testStrategy = Fixtures.TestStrategy1();
		
		Test.startTest();
		string treeString = BuildTree.Assemble(testStrategy);
		Test.stopTest();

		System.assert(treeString == 'done');
	
	}

	@isTest
	public static void CanBuildTreeItem() {
		Strategy testStrategy = Fixtures.TestStrategy1();
		string curNodeName = 'RootNode';
		
		Test.startTest();
		BuildTree.TreeNode treeNode = BuildTree.BuildTreeItem(testStrategy, curNodeName);
		Test.stopTest();

		System.assert(treeNode.label == 'done');
	
	}



	
    




}
