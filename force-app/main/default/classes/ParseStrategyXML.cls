public with sharing class ParseStrategyXML {
    public ParseStrategyXML() {

    }


    // Represents an NBA Recommendation Strategy
    public with sharing class StrategyNode {
        @TestVisible String name;
        @TestVisible String description;
        @TestVisible String definition;
        @TestVisible String type;
        @TestVisible String parentNode;
    }

    // Represents an NBA Recommendation Strategy
    public with sharing class Strategy {
        @TestVisible String name;
        @TestVisible List<StrategyNode> nodes;

        public Strategy() {
        	nodes = new List<StrategyNode> ();
        }
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

    public static StrategyNode parseStrategyNode(Dom.XMLNode curNodeXML, string ns) {
        StrategyNode node = new StrategyNode();
        node.name = curNodeXML.getChildElement('name', ns).getText();
        node.description = curNodeXML.getChildElement('description',ns).getText();
        node.definition = curNodeXML.getChildElement('definition',ns).getText();
        node.parentNode = curNodeXML.getChildElement('parentNode', ns).getText();
        
        return node;
    }


}
