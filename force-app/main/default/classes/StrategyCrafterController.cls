public class StrategyCrafterController {
	@AuraEnabled
	public static String generateTreeData(String xml){	
		return BuildTree.Assemble(ParseStrategyXML.parseStrategyString(xml));
	}

	@AuraEnabled
    public static List<String> getStrategyNames() {
        List<Strategy__c> curStrategies =
        		 [SELECT  Name 
                FROM Strategy__c];
        List<String> strategyNames = new List<String>();
        for (Strategy__c curStrat : curStrategies) {
   				strategyNames.add(curStrat.name);
			}
		return strategyNames;
    }


    @AuraEnabled
    public static Strategy getStrategyByName() {
       //createa a class for the xml version. or not
    	//
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
	public static String assembleStrategyString(Strategy curStrat){	
		String result = '';
		try {
			result = WriteXML.WriteStrategy(curStrat);	
		}
		catch (Exception ex) {
			result = ex.getMessage();
		}
		return result;
		
	}
}