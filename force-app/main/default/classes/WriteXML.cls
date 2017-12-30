public with sharing class WriteXML {
    public WriteXML() {

    }
    //returns an XML string suitable for saving to an external text file, and which can then be read back in if desired
    public static string WriteStrategy(Strategy curStrategy){

      		//add the headerlines
			DOM.Document doc = new DOM.Document();
	        String myNamespace = 'http://soap.sforce.com/2006/04/metadata';
	        dom.XmlNode stratXMLRootNode = doc.createRootElement('recommendationStrategy',myNamespace,'');

	        dom.XmlNode name = stratXMLRootNode.addChildElement('recommendationStrategyName', null,null).addTextNode(curStrategy.name);
	        dom.XmlNode description = stratXMLRootNode.addChildElement('description', null, null).addTextNode(curStrategy.description);
	        dom.XmlNode masterLabel = stratXMLRootNode.addChildElement('masterLabel', null, null).addTextNode(curStrategy.masterLabel);
    		        
    		//create the nodes

    		for(StrategyNode curNode : curStrategy.nodes) {
    			//this appends the returning node to the list being built here
    			stratXMLRootNode.insertBefore(WriteXML.WriteStrategyNode(curNode), null);
    		}
        
        	return doc.toXmlString();


    }

    //given a StrategyNode, return a dom.XmlNode version suitable for outputing to  XML string
    public static dom.XmlNode WriteStrategyNode(StrategyNode curStrategyNode) {

			DOM.Document doc = new DOM.Document();

	        //String myNamespace = 'http://soap.sforce.com/2006/04/metadata';
	        
	        dom.XmlNode stratXMLNode
	            = doc.createRootElement('strategyNode', null, null);
	        
	        dom.XmlNode name = stratXMLNode.addChildElement('name', null, null).addTextNode(curStrategyNode.name);
 			dom.XmlNode description = stratXMLNode.addChildElement('description', null, null).addTextNode(curStrategyNode.description);
	        dom.XmlNode type = stratXMLNode.addChildElement('type', null, null).addTextNode(curStrategyNode.type);
	        dom.XmlNode definition = stratXMLNode.addChildElement('definition', null, null).addTextNode(curStrategyNode.definition);
	        dom.XmlNode parentNodeName = stratXMLNode.addChildElement('parentNode', null, null).addTextNode(curStrategyNode.parentNodeName);
	        
	        return stratXMLNode;
    }
}
