public class StrategyCrafterController {
	@AuraEnabled
	public static String parseInputFile(String xml){	
		return BuildTree.Assemble(ParseStrategyXML.parseStrategyString(xml));
	}

	@AuraEnabled
	public static Strategy getStrategy(String xml){	
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
	public static String getStrategyString(String xml){	
		String result = '';
		try{
			Strategy str = ParseStrategyXML.parseStrategyString(xml);
			for (StrategyNode node : str.nodes) {
				result += ' \nname:' + node.name + ' \ndescription:' + node.description +  ' \ndefinition:' + node.definition + ' \ntype:' + node.type;
			}	
		}
		catch (Exception ex) {
			return ex.getMessage();
		}
		
		return result;
	}	

	@AuraEnabled
	public static String getStr(String xml) {
		System.debug(xml);
		return xml;
	}
}