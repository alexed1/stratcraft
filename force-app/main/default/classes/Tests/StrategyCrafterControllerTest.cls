@isTest
public class StrategyCrafterControllerTest {
	    
    @isTest
    public static void getStrategyNames_Always_ReturnsListOfNames() {
        Strategy__c newStrategy = new Strategy__c();
        newStrategy.name = 'Test';
        insert newStrategy;
        Test.startTest();
        	List<string> strategyNames = StrategyCrafterController.getStrategyNames();
        Test.stopTest();
        System.assertEquals(1, strategyNames.size(), 'The number of strategy name is incoorect');
        System.assertEquals('Test', strategyNames[0], 'Strategy name is incorrect');        
    }
    
    @isTest
    public static void loadStrategy_WhenStrategyExists_ReturnsIt() {
        Strategy__c newStrategy = new Strategy__c();
        newStrategy.name = 'Name';
		newStrategy.StrategyXML__c = FixturesXml.EmptyStrategyXml;
        insert newStrategy;
        Test.startTest();
        	Strategy actual = StrategyCrafterController.loadStrategy('Name');
        Test.stopTest();
        System.assert(actual != null, 'No strategy was retrieved');
        System.assertEquals('Name', actual.name, 'The name of the retrieved strategy doesn\'t match');
    }
    
    @isTest
    public static void loadStrategy_WhenStrategyDoesntExist_ReturnsNull() {
        Strategy actual = StrategyCrafterController.loadStrategy('Test');
        System.assertEquals(null, actual, 'Nothing should be returned for non-existing strategy');
    }

	@isTest
	public static void persistStrategy_WhenStrategyIsValid_SuccessfullySavesIt() {
		String strategyJson = FixturesJson.EmptyNoIdStrategyJson;
		List<Strategy__c> curStratList = [SELECT Name, StrategyXML__c, Id FROM Strategy__c WHERE (Name = 'Name')]; 
		System.assertEquals(0, curStratList.size(), 'No strategy should exist prior to the test');
		Test.startTest();
			String result = StrategyCrafterController.persistStrategy(strategyJson);
		Test.stopTest();
		System.assertEquals('SUCCESS', result, 'Result doesn\'t demonstrate success');
		curStratList = [SELECT Name, StrategyXML__c, Id FROM Strategy__c WHERE (Name = 'Name')]; 
		System.assertEquals(1, curStratList.size(), 'Only one strategy was expected to be returned');
	}
}