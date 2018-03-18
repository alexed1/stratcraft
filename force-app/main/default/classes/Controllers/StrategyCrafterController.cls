//this controller is used to convert xml to Strategy object and back

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