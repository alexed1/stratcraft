public class StrategyCrafterController {
	@AuraEnabled
	public static String generateTreeData(String xml){	
		return BuildTree.Assemble(ParseStrategyXML.parseStrategyString(xml));
	}

	@AuraEnabled
	public static Strategy parseStrategyString(String xml){	
		Strategy result = new Strategy();
		try {
			result = ParseStrategyXML.parseStrategyString(xml);	
		}
		catch (Exception ex) {
			result.name = ex.getMessage();
		}
		return result;
		
	}

    @AuraEnabled
    public static String refreshStrategy(String strStrat) {
        Strategy strat = (Strategy)JSON.deserializeStrict(strStrat, Strategy.class);

        //Creating a copy strategy - cause deserialized Strategy returns wrong result
        Strategy newstrat = new Strategy();
        newstrat.name = strat.name;
        newstrat.description = strat.description;
        newstrat.masterLabel = strat.masterLabel;
        newstrat.nodes = new List<StrategyNode>();
        
        for (StrategyNode node : strat.nodes) {
            StrategyNode newNode = new StrategyNode();
            newNode.name = node.name;
            newNode.description = node.description;
            newNode.definition = node.definition;
            newNode.type = node.type;
            newNode.parentNodeName = node.parentNodeName;
            newNode.parentStrategy = newstrat;
            newstrat.nodes.add(newNode);
        }
        
        String str;

        try {
            str = BuildTree.Assemble(newstrat);
        }
        catch (Exception ex) {
            return 'Validation error - ' + ex.getMessage();
        }
        return str;
    }

    private static void getchildStrategies() {



    } 
}