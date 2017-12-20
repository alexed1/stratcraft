public with sharing class ParseStrategyXML {
    public ParseStrategyXML() {

    }


    // Represents an NBA Recommendation Strategy
    public class StrategyNode {
        String name;
        String description;
        String definition;
        String type;
        String parentNode;
    }

    // Represents an NBA Recommendation Strategy
    public class Strategy {
        String name;
        StrategyNode[] nodes;
    }


    @auraEnabled
    public static Strategy parseStrategyString(string xml) {
        Dom.Document doc = new Dom.Document();
        doc.load(xml);

        Strategy curStrat = new Strategy();

        Dom.XMLNode recommendationStrategy = doc.getRootElement();
        
        curStrat.name = recommendationStrategy.getChildElement('recommendationStrategyName', null).getText();

        
        for(Dom.XMLNode child : recommendationStrategy.getChildElements()) {
            if (child.getName() == 'strategyNode') {
                curStrat.nodes.add(parseStrategyNode(child));
            }
        }
        return curStrat;
    }

    public static StrategyNode parseStrategyNode(Dom.XMLNode curNodeElement) {
        StrategyNode node = new StrategyNode();
        node.name = curNodeElement.getChildElement('name', null).getText();
        node.description = curNodeElement.getChildElement('description', null).getText();
        node.definition = curNodeElement.getChildElement('definition', null).getText();
        node.type = curNodeElement.getChildElement('type', null).getText();
        node.parentNode = curNodeElement.getChildElement('parentNode', null).getText();
        return node;
    }


}
