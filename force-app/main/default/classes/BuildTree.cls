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

    //a StrategyNode is our core datastructure for representing Strategy Nodes
    //a TreeNode is a specialized structure designed to convert neatly to the json required by the Tree control
    public static TreeNode BuildTreeItem(Strategy curStrategy, string curNodeName) {
       //find the node matching the current nodename
       StrategyNode curStratNode = curStrategy.FindNodeByName(curNodeName);
    
       TreeNode curTreeItem = new TreeNode();
       curTreeItem.label = curStratNode.name;
       curTreeItem.name = curTreeItem.label;
       curTreeItem.href = '#' + curStratNode.name;
    

    	// Find the child nodes for this node by searching the strategy for all strategyNodes that have as their parent curStrategyNodeName
    	
    // For each strategyNode that you find:
        // make a (recursive) call to BuildTreeItem.
        // The return value will be an items array. Call it childItem. 
        // Add childItem to the “items” List of curTreeItem, creating the “items”element if it doesn’t exist. 
    // Return curTreeItem

    
    return curTreeItem;
    }


}
