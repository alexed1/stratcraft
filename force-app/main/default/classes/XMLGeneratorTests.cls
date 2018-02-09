@isTest
public with sharing class XMLGeneratorTests {
    public XMLGeneratorTests() {

    }

    	@isTest
		public static void CanWriteStrategyXML() {
			Strategy curStrat = Fixtures.TestStrategy2();

			//Test
			string finishedXMLString = XMLGenerator.StrategyToXML(curStrat);

			//Validate
			//validate by sending the response through the parser and then comparing the final strategy object with the original fixture
    		Strategy endStrat = ParseStrategyXML.parseStrategyString(finishedXMLString);

			System.assertEquals(curStrat.name, endStrat.name);
			System.assertEquals(curStrat.description, endStrat.description);
			System.assertEquals(curStrat.masterLabel, endStrat.masterLabel);
			System.assertEquals(curStrat.nodes.size(), endStrat.nodes.size());
			System.assertEquals(curStrat.nodes[0].name, endStrat.nodes[0].name);
			
			



		}

		@isTest
		public static void CanWriteStrategyNodeXML() {

			Strategy curStrat = new Strategy(); //basically a stub
			StrategyNode curNode = Fixtures.IfPaymentPastDueElseChurnNode(curStrat);

			//Test
			dom.XmlNode nodeXML = XMLGenerator.StrategyNodeToXML(curNode);
	        

	        //Validate
	        //to test the result, we send it to the parsing class and see if we get what we started with
	        StrategyNode endNode = ParseStrategyXML.parseStrategyNode(nodeXML, null, curStrat);			

			System.assertEquals(curNode.name, endNode.name);
		    System.assertEquals(curNode.description, endNode.description);
		    System.assertEquals(curNode.type, endNode.type);
		    System.assertEquals(curNode.definition, endNode.definition);
		    System.assertEquals(curNode.parentNodeName, endNode.parentNodeName);

		    
		}

    

}
