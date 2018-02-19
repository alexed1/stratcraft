//xml data is stored in a Strategy__c custom object. 
//after it's retrieved by name, it's passed to the client as Strategy__c, where it's converted to an Object called strategyRecord
//the client then evolves a Strategy object of nodes called curStrat
//at persistence time, a curStrat Strategy gets uploaded
//we should use it to generate an XML string and then create a Strategy__c to save

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
    public static Strategy__c loadStrategy(string name) {
		List<Strategy__c> curStratList = [SELECT Name, StrategyXML__c, Id FROM Strategy__c WHERE (Name = :name)];         
       	if (curStratList.Size() != 1)
            throw new QueryException('Either 0 or more than 1 strategy was returned when that name was passed in');        
		return curStratList[0];
	} 

	@AuraEnabled
	public static Strategy parseStrategyString(String xml){	
		Strategy result = new Strategy();
		result = ParseStrategyXML.parseStrategyString(xml);	
		return result;		
	}

	@AuraEnabled
	public static String persistStrategy(String curStratString){	
		Strategy curStrat = (Strategy)System.JSON.deserializeStrict(curStratString, Strategy.Class);
		System.debug('starting persistStrategy');
		String result = '';
		try {
			result = curStrat.Persist();		
		}
		catch (Exception ex) {
			result = ex.getMessage();
		}
		return result;
		
	}
}