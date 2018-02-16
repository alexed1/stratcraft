@isTest
public with sharing class BuildTreeTests {
	
    @isTest
	public static void CanBuildTree() {
		Strategy testStrategy = Fixtures.TestStrategy2();
		
		Test.startTest();
		string treeString = BuildTree.Assemble(testStrategy);
		Test.stopTest();
		List<BuildTree.TreeNode> treeBuilt = (List<BuildTree.TreeNode>)JSON.deserialize(treeString, List<BuildTree.TreeNode>.class);
        System.assertEquals(1, treeBuilt.size(), 'Tree must contain a single root node');
        System.assertEquals(1, treeBuilt[0].items.size(), 'Root node must contain a single child');
	}

	@isTest
	public static void CanBuildTreeItem() {
		Strategy testStrategy = Fixtures.TestStrategy2();
		string curNodeName = 'RootNode';
		
		Test.startTest();
		BuildTree.TreeNode treeNode = BuildTree.BuildTreeItems(testStrategy, curNodeName);
		Test.stopTest();
		System.debug('treeNode is: ' + treeNode);
		System.assert(treeNode.items.size() == 1, 'Should only have a single child item node');
		System.assert(treeNode.items[0].name == 'IfPaymentPastDueElseChurnNode', 'Name of the child node should be IfPaymentPastDueElseChurnNode');
	}



	
    




}