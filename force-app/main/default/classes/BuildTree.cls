public with sharing class BuildTree {
    public BuildTree() {

    }

    public with sharing class TreeNode {
    	public string name;
    	public boolean expanded;
    	public List<TreeNode> items;
    	public string label { get; set; }
		public string href;
    }

    public static string Assemble(Strategy curStrategy) {
		//find the strategyNode with name RootNode and assign it to curStrategyNode..
		//Create an empty array of TreeNodes called curItemArray  
    	//add to the curItemArray the results of a call to BuildTreeItem
    	//convert to json and return
    	return 'done';
    }

    public static TreeNode BuildTreeItem(Strategy curStrategy, string curNodeName) {
    // find the curNode in the curStrategy
    // Create a new curTreeItem
    // Add set  “label” and “name”  equal to curStrategyNode.Name 
    // Add set “href”,to  “#foo” where foo is curStrategyNode.Name
    // Search the strategy for all strategyNodes that have as their parent curStrategyNodeName
    // For each strategyNode that you find:
        // make a (recursive) call to BuildTreeItem.
        // The return value will be an items array. Call it childItem. 
        // Add childItem to the “items” List of curTreeItem, creating the “items”element if it doesn’t exist. 
    // Return curTreeItem

    TreeNode curTreeItem = new TreeNode();
    return curTreeItem;
    }


}
