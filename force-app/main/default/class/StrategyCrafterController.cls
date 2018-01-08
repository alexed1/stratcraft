public class StrategyCrafterController {
	@AuraEnabled
	public static String parseInputFile(String xml){	
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
}