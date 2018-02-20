@isTest
public class StrategyCrafterControllerTest {
	//TODO: replace with fixture data
	// @isTest
	// public static void parseStrategyString_WhenStringIsValidXML_SuccessfullyParsesIt() {
	// 	String xml = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n' + 
	// 			'<RecommendationStrategy xmlns=\"http://soap.sforce.com/2006/04/metadata\">\r\n' + 
	// 			'<description>TestStrategy</description>\r\n' + 
	// 			'<recommendationStrategyName>testStrat1</recommendationStrategyName>\r\n    ' + 
	// 			'<masterLabel>SomeMasterLabel</masterLabel>\r\n\r\n\t' + 
	// 			'<!-- Root -->\r\n\t<strategyNode>\r\n\t\t<name>RootNode</name>\r\n\t\t' + 
	// 			'<description>the root</description>\r\n\t\t' +
	// 			'<parentNode></parentNode>\r\n\t\t<type>2<!--Union--></type>\r\n\t\t' + 
	// 			'<definition>{removeDuplicates: true}</definition>\r\n\t</strategyNode>\r\n\r\n\t' +
	// 			'<!-- Payment Past Due -->\r\n\t<strategyNode>' +
	// 			'\r\n\t\t<name>IfPaymentPastDueElseChurnNode</name>\r\n\t\t' + 
	// 			'<description>If payment is past due request payment else churn</description>' +
	// 			'\r\n\t\t<parentNode>RootNode</parentNode>\r\n\t\t' + 
	// 			'<type>4<!--If--></type>\r\n\t\t<definition>{testDefinition : true}</definition>' +
	// 			'\r\n\t</strategyNode>\r\n\r\n</RecommendationStrategy>\r\n';
				
	// 	Test.startTest();
	// 		Strategy curStrategy = StrategyCrafterController.parseStrategyString(xml);
	// 	Test.stopTest();

	// 	System.assertEquals(curStrategy.name, 
	// 				'testStrat1', 
	// 				'Strategy name was parsed incorrect');
	// 	System.assertEquals(curStrategy.nodes.size(), 2, 
	// 				'Wrong number of nodes');
	// 	System.assertEquals(curStrategy.nodes[0].name, 
	// 				'RootNode', 
	// 				'First node name was parsed incorrect');
	// 	System.assertEquals(curStrategy.nodes[0].definition, 
	// 				'{removeDuplicates: true}', 
	// 				'First node definition was parsed incorrect');
	// 	System.assertEquals(curStrategy.nodes[1].name, 
	// 				'IfPaymentPastDueElseChurnNode', 
	// 				'Second node name was parsed incorrect');
	// 	System.assertEquals(curStrategy.nodes[1].definition, 
	// 				'{testDefinition : true}', 
	// 				'Second node definition was parsed incorrect');

	// }

	// @isTest
	// public static void parseStrategyString_WhenStringIsNotAnXML_Fails() {
	// 	String xml = 'test fail xml';
		
	// 	Test.startTest();
    //     	Strategy curStrategy = StrategyCrafterController.parseStrategyString(xml);
    //     Test.stopTest();
    //     System.debug(curStrategy);        
    //     System.assert(curStrategy.name == null,	'Failed strategy must have an empty name');   
    //     System.assert(curStrategy.description == null, 'Failed strategy must have an empty description');
    //     System.assert(curStrategy.notification.errors[0].startsWith('Failed to parse XML'), 'Failed strategy notification must contain an error message');
	// }	
    
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
        newStrategy.name = 'Test';
        insert newStrategy;
        Test.startTest();
        	Strategy__c actual = StrategyCrafterController.loadStrategy('Test');
        Test.stopTest();
        System.assert(actual != null, 'No strategy was retrieved');
        System.assertEquals('Test', actual.name, 'The name of the retrieved strategy doesn\'t match');
    }
    
    @isTest
    public static void loadStrategy_WhenStrategyDoesntExist_Fails() {
        try {
            Strategy__c actual = StrategyCrafterController.loadStrategy('Test');
            System.assert(false, 'Method should throw exception for non-existing strategy');
        }        
        catch (QueryException e) { }            
    }
}