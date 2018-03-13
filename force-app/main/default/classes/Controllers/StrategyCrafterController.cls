//xml data is stored in a Strategy__c custom object.
//after it's retrieved by name, it's passed to the client as Strategy__c, where it's converted to an Object called strategyRecord
//the client then evolves a Strategy object of nodes called currentStrategy
//at persistence time, a current strategy Strategy gets uploaded
//we should use it to generate an XML string and then create a Strategy__c to save

public class StrategyCrafterController {

@AuraEnabled
public static Strategy strategyXMLToObject(String xml) {
	Strategy parsedStrategy = StrategyXmlConverter.convertXmlToStrategy(xml);
	return parsedStrategy;
}

@AuraEnabled
public static String strategyJSONtoXML(String strategyJson){
	Strategy strategy = StrategyJsonConverter.convertJsonToStrategy(strategyJson);
	try {
		System.debug('Started persisting strategy ' + strategy.name);
		String strategyXml = StrategyXmlConverter.convertStrategyToXml(strategy);
		return strategyXml;
	}
	catch(Exception exc) {
		throw new AuraException('Couldn\'t convert strategy JSON object to XML');
	}
}
}