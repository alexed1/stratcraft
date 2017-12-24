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
        @TestVisible StrategyNode[] nodes;
    }


    @auraEnabled
    public static Strategy parseStrategyString(string xml) {
        Dom.Document doc = new Dom.Document();
        doc.load(xml);

        Strategy curStrat = new Strategy();

        Dom.XMLNode recommendationStrategy = doc.getRootElement();
        System.debug('root element is: ' + recommendationStrategy);
        
        curStrat.name = recommendationStrategy.getChildElement('recommendationStrategyName', null).getText();

        
        for(Dom.XMLNode child : recommendationStrategy.getChildElements()) {
            if (child.getName() == 'strategyNode') {
                curStrat.nodes.add(parseStrategyNode(child));
            }
        }
        return curStrat;
    }

    public static StrategyNode parseStrategyNode(Dom.XMLNode curNodeXML) {
        StrategyNode node = new StrategyNode();
        node.name = curNodeXML.getChildElement('name', null).getText();
        node.description = curNodeXML.getChildElement('description', null).getText();
        node.definition = curNodeXML.getChildElement('definition', null).getText();
        node.type = curNodeXML.getChildElement('type', null).getText();
        node.parentNode = curNodeXML.getChildElement('parentNode', null).getText();
        return node;
    }


}
