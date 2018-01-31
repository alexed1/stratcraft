
//This Apex class takes an XML recommendationStrategy and parses it into an Apex Strategy class. we use apex to take 
//advantage of the xml support in apex and because the ability to use external xml javascript libraries is clumsy.


public with sharing class ParseStrategyXML {
    public ParseStrategyXML() {
    }

    @auraEnabled
    public static Strategy parseStrategyString(string xml) {
        Dom.Document doc = new Dom.Document();
        Strategy curStrat = new Strategy();
        try {
            System.debug('entering try block');
            System.debug('xml is:' + xml);
            doc.load(xml);
            System.debug('loaded xml string into doc');
            //namespace
            string ns = 'http://soap.sforce.com/2006/04/metadata';

            Dom.XMLNode recommendationStrategy = doc.getRootElement();
            curStrat.name = recommendationStrategy.getChildElement('recommendationStrategyName', ns).getText();
            curStrat.description = recommendationStrategy.getChildElement('description', ns).getText();
            curStrat.masterLabel = recommendationStrategy.getChildElement('masterLabel', ns).getText();
            System.debug('finished initial extractions');
            System.debug('curStrat name is: ' + curStrat.name);
            System.debug('curStrat description is: ' + curStrat.description);
            //parse all of the strategyNodes
            for(Dom.XMLNode child : recommendationStrategy.getChildElements()) {
                if (child.getName() == 'strategyNode') {
                    curStrat.nodes.add(parseStrategyNode(child, ns, curStrat));
                }
            }
            System.debug('size = ' +curStrat.nodes.Size() );
            if (curStrat.nodes.Size() == 0) {
                curStrat.notification.addError('Provided XML generated zero nodes. That is, frankly, lame.');
            }
        }
        catch (Exception e) {
            curStrat.notification.addError(e.getMessage());

        }

        return curStrat;
    }

    public static StrategyNode parseStrategyNode(Dom.XMLNode curNodeXML, string ns, Strategy curStrat) {
        StrategyNode node = new StrategyNode();
        node.name = curNodeXML.getChildElement('name', ns).getText();
        node.description = curNodeXML.getChildElement('description',ns).getText();
        node.definition = curNodeXML.getChildElement('definition',ns).getText().replaceAll('[\\s]', '');
        node.parentNodeName = curNodeXML.getChildElement('parentNode', ns).getText();
        node.type = curNodeXML.getChildElement('type', ns).getText();
        node.parentStrategy = curStrat;
        return node;
    }
	

}
