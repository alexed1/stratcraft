public class TreeNodeController {
	@AuraEnabled
	public static String generateTreeData(String xml){	
		return BuildTree.Assemble(ParseStrategyXML.parseStrategyString(xml));
	}

 

}