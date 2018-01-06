public with sharing class BuildTree {
    public static Integer treeCount = 0;
    public BuildTree() {

    }

    public with sharing class TreeNode {
    	public string name;
    	public boolean expanded;
    	public List<TreeNode> items;
      public String parentNode;
    	public string label { get; set; }
		public string href;

		public TreeNode() {
			items = new List<TreeNode>();
			expanded = false;
		}
    }

    public static string Assemble(Strategy curStrategy) {
		//find the strategyNode with name RootNode and assign it to curStrategyNode..
    
    	StrategyNode curStratNode = curStrategy.FindNodeByName('RootNode');
    	
    	//Create an empty array of TreeNodes    
    	//add the results of a call to BuildTreeItem
    	List<TreeNode> treeRepresentation = new List<TreeNode>();
    	treeRepresentation.add(BuildTreeItems(curStrategy, 'RootNode'));
    	string jsonTreeItems = JSON.serialize(treeRepresentation);
    	System.debug('treeItems: ' + jsonTreeItems);
      validateTree(curStrategy);
    	return jsonTreeItems;
    }

    //a StrategyNode is our core datastructure for representing Strategy Nodes
    //a TreeNode is a specialized structure designed to convert neatly to the json required by the Tree control
    //'items' is used by the TreeNode to represent a set of sibling nodes with a common parent. see https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/aura_compref_lightning_tree.htm
    public static TreeNode BuildTreeItems(Strategy curStrategy, string curNodeName) {
       //find the node matching the current nodename
       StrategyNode curStratNode = curStrategy.FindNodeByName(curNodeName);
       if (curStratNode == null) throw new BaseException('unable to find a node with name = ' + curNodeName + '. make sure you have a RootNode');
       treeCount++;

       TreeNode curTreeNode = new TreeNode();
       curTreeNode.label = curStratNode.name;
       curTreeNode.name = curTreeNode.label;
       curTreeNode.parentNode = curStratNode.parentNodeName;
       //curTreeNode.href = '#' + curStratNode.name;
    
       // Find the child nodes for this node by searching the strategy for all strategyNodes that have as their parent the current node.
       List<StrategyNode> childNodes = curStratNode.FindChildNodes();
    	
       for(StrategyNode childNode : childNodes){
       		curTreeNode.items.add(BuildTreeItems(curStrategy, childNode.name));
       }
    
       return curTreeNode;
    }

    public static void validateTree(Strategy curStrategy) {
      if (curStrategy.nodes.size() != treeCount){
        throw new BaseException('Exception during saving a tree - not all nodes were used');
      }
    }
}
