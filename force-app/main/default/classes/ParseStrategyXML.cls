
//This Apex class takes an XML recommendationStrategy and parses it into an Apex Strategy class. we use apex to take 
//advantage of the xml support in apex and because the ability to use external xml javascript libraries is clumsy.


public with sharing class ParseStrategyXML {
    public ParseStrategyXML() {

    }


    @auraEnabled
    public static Stratcraft.Strategy parseStrategyString(string xml) {
        Dom.Document doc = new Dom.Document();
        doc.load(xml);

        Stratcraft.Strategy curStrat = new Stratcraft.Strategy();
        //curStrat.nodes=[];
        //namespace
        string ns = 'http://soap.sforce.com/2006/04/metadata';

        Dom.XMLNode recommendationStrategy = doc.getRootElement();
        Dom.XMLNode recstratname = recommendationStrategy.getChildElement('recommendationStrategyName', ns);
        curStrat.name = recommendationStrategy.getChildElement('recommendationStrategyName', ns).getText();

        //parse all of the strategyNodes
        for(Dom.XMLNode child : recommendationStrategy.getChildElements()) {
            if (child.getName() == 'strategyNode') {
                curStrat.nodes.add(parseStrategyNode(child, ns));
            }
        }
        return curStrat;
    }

    public static Stratcraft.StrategyNode parseStrategyNode(Dom.XMLNode curNodeXML, string ns) {
        Stratcraft.StrategyNode node = new Stratcraft.StrategyNode();
        node.name = curNodeXML.getChildElement('name', ns).getText();
        node.description = curNodeXML.getChildElement('description',ns).getText();
        node.definition = curNodeXML.getChildElement('definition',ns).getText();
        node.parentNode = curNodeXML.getChildElement('parentNode', ns).getText();
        
        return node;
    }


}
