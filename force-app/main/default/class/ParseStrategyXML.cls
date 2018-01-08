
//This Apex class takes an XML recommendationStrategy and parses it into an Apex Strategy class. we use apex to take 
//advantage of the xml support in apex and because the ability to use external xml javascript libraries is clumsy.


public with sharing class ParseStrategyXML {
    public ParseStrategyXML() {
    }

    @auraEnabled
    public static Strategy parseStrategyString(string xml) {
        Dom.Document doc = new Dom.Document();
        doc.load(xml);

        Strategy curStrat = new Strategy();
        //curStrat.nodes=[];
        //namespace
        string ns = 'http://soap.sforce.com/2006/04/metadata';

        Dom.XMLNode recommendationStrategy = doc.getRootElement();
        //System.debug (recommendationStrategy.getChildElement('recommendationStrategyName', ns).getText());
        curStrat.name = recommendationStrategy.getChildElement('recommendationStrategyName', ns).getText();
        curStrat.description = recommendationStrategy.getChildElement('description', ns).getText();
        curStrat.masterLabel = recommendationStrategy.getChildElement('masterLabel', ns).getText();
                //Dom.XMLNode recstratname = recommendationStrategy.getChildElement('recommendationStrategyName', ns);

        //parse all of the strategyNodes
        for(Dom.XMLNode child : recommendationStrategy.getChildElements()) {
            if (child.getName() == 'strategyNode') {
                curStrat.nodes.add(parseStrategyNode(child, ns, curStrat));
            }
        }
        return curStrat;
    }

    public static StrategyNode parseStrategyNode(Dom.XMLNode curNodeXML, string ns, Strategy curStrat) {
        StrategyNode node = new StrategyNode();
        node.name = curNodeXML.getChildElement('name', ns).getText();
        node.description = curNodeXML.getChildElement('description',ns).getText();
        node.definition = curNodeXML.getChildElement('definition',ns).getText();
        node.parentNodeName = curNodeXML.getChildElement('parentNode', ns).getText();
        node.type = curNodeXML.getChildElement('type', ns).getText();
        node.parentStrategy = curStrat;
        return node;
    }
	

}
