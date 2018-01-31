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
    public static String loadStrategyXML(string name) {

         System.debug('name is: ' + name);
         List<Strategy__c> curStratList =
        		 [SELECT  StrategyXML__c FROM Strategy__c WHERE (Name = :name)];
         System.debug('curStratList[0] is: ' + curStratList[0]);
       	 if (curStratList.Size() != 1)
       	 	throw new QueryException('either 0 or more than 1 strategy was returned when that name was passed in. Either way, you are screwed');
        
		return curStratList[0].StrategyXML__c;
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