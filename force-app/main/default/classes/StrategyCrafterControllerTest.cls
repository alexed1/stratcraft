@isTest
public class StrategyCrafterControllerTest {

	@isTest
	public static void parseInputFileTest() {
		String xml = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n' + 
				'<RecommendationStrategy xmlns=\"http://soap.sforce.com/2006/04/metadata\">\r\n' + 
				'<description>TestStrategy</description>\r\n' + 
				'<recommendationStrategyName>testStrat1</recommendationStrategyName>\r\n    ' + 
				'<masterLabel>SomeMasterLabel</masterLabel>\r\n\r\n\t' + 
				'<!-- Root -->\r\n\t<strategyNode>\r\n\t\t<name>RootNode</name>\r\n\t\t' + 
				'<description>the root</description>\r\n\t\t' +
				'<parentNode></parentNode>\r\n\t\t<type>2<!--Union--></type>\r\n\t\t' + 
				'<definition>{ removeDuplicates: true }</definition>\r\n\t</strategyNode>\r\n\r\n\t' +
				'<!-- Payment Past Due -->\r\n\t<strategyNode>' +
				'\r\n\t\t<name>IfPaymentPastDueElseChurnNode</name>\r\n\t\t' + 
				'<description>If payment is past due request payment else churn</description>' +
				'\r\n\t\t<parentNode>RootNode</parentNode>\r\n\t\t' + 
				'<type>4<!--If--></type>\r\n\t\t<definition>{testDefinition : true}</definition>' +
				'\r\n\t</strategyNode>\r\n\r\n</RecommendationStrategy>\r\n';

		Test.startTest();
			String treeString = StrategyCrafterController.parseInputFile(xml);
		Test.stopTest();
		
		//System.assert(false, treeString);
		System.assert(treeString.startsWith('[{"name":"RootNode","label":"RootNode",'));
	}

	@isTest
	public static void parseStrategyStringPositiveTest() {
		String xml = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n' + 
				'<RecommendationStrategy xmlns=\"http://soap.sforce.com/2006/04/metadata\">\r\n' + 
				'<description>TestStrategy</description>\r\n' + 
				'<recommendationStrategyName>testStrat1</recommendationStrategyName>\r\n    ' + 
				'<masterLabel>SomeMasterLabel</masterLabel>\r\n\r\n\t' + 
				'<!-- Root -->\r\n\t<strategyNode>\r\n\t\t<name>RootNode</name>\r\n\t\t' + 
				'<description>the root</description>\r\n\t\t' +
				'<parentNode></parentNode>\r\n\t\t<type>2<!--Union--></type>\r\n\t\t' + 
				'<definition>{removeDuplicates: true}</definition>\r\n\t</strategyNode>\r\n\r\n\t' +
				'<!-- Payment Past Due -->\r\n\t<strategyNode>' +
				'\r\n\t\t<name>IfPaymentPastDueElseChurnNode</name>\r\n\t\t' + 
				'<description>If payment is past due request payment else churn</description>' +
				'\r\n\t\t<parentNode>RootNode</parentNode>\r\n\t\t' + 
				'<type>4<!--If--></type>\r\n\t\t<definition>{testDefinition : true}</definition>' +
				'\r\n\t</strategyNode>\r\n\r\n</RecommendationStrategy>\r\n';
				
		Test.startTest();
			Strategy curStrategy = StrategyCrafterController.parseStrategyString(xml);
		Test.stopTest();

		System.assertEquals(curStrategy.name, 
							'testStrat1', 
							'Strategy name was parsed incorrect');
		System.assertEquals(curStrategy.nodes.size(), 2, 
							'Wrong number of nodes');
		System.assertEquals(curStrategy.nodes[0].name, 
							'RootNode', 
							'First node name was parsed incorrect');
		System.assertEquals(curStrategy.nodes[0].definition, 
							'{removeDuplicates: true}', 
							'First node definition was parsed incorrect');
		System.assertEquals(curStrategy.nodes[1].name, 
							'IfPaymentPastDueElseChurnNode', 
							'Second node name was parsed incorrect');
		System.assertEquals(curStrategy.nodes[1].definition, 
							'{testDefinition : true}', 
							'Second node definition was parsed incorrect');

	}

	@isTest
	public static void parseStrategyStringNegativeTest() {
		String xml = 'test fail xml';
		String expectedFailMessage = '';
		
		Test.startTest();
			Strategy curStrategy = StrategyCrafterController.parseStrategyString(xml);
		Test.stopTest();

		System.assertEquals(true, 
							curStrategy.name.startsWith('Failed to parse XML'), 
							'Wrong error - ' + curStrategy.name);
	}		

}