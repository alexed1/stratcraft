public with sharing class ExternalConnectionNodeXmlConverter extends BaseNodeXmlConverter {
    
    private ExternalConnectionNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        ExternalConnectionNode result = (ExternalConnectionNode)super.convertXmlToNode(node, xmlNamespace); 
        System.debug('in ExternalConnectionNodeXmlConverter after base conversion, result is:' + result);
        if (result == null) {
            return null;
        }
        for (Dom.XMLNode child : node.getChildElements()) {
            String childName = child.getName();

            if (childName == 'argument') {
                ArgumentPair argPair = new ArgumentPair();
                argPair.name = child.getChildElement('name', xmlNamespace).getText();
                argPair.value = child.getChildElement('value', xmlNamespace).getText();
                result.argPairs.Add(argPair);
            }

            if (childName == 'type') {
                result.type = child.getText();
            }
            if (childName == 'action') {
                result.action = child.getText();
            }
           


           System.debug('in ExternalConnectionNodeXmlConverter child loop result is:' + result);

        }     

          //right now all nodes are placed in a tree by walker. external connections really don't belong
        //in the tree but it's too much work at the moment to separate them out
        //so we add a parentnode pointing to the root.
        //since the node class doesn't have a parent node, we can just ignore this value when converting the json back to the node
        // done in base now: result.parentNodeName = 'RootNode';

        return result;
    }

    protected override BaseNode createNewNode() { return new ExternalConnectionNode(); }

    public override Dom.XmlNode convertNodeToXml(BaseNode node) {
        Dom.XmlNode result = super.convertNodeToXml(node);
        if (result == null) {
            return null;
        }
        ExternalConnectionNode actualNode = (ExternalConnectionNode)node;

        for (ArgumentPair argPair : actualNode.argPairs) {
            Dom.XmlNode argumentNode = result.addChildElement('argument', null, null);
            argumentNode.addChildElement('name', null, null).addTextNode(argPair.name);
            argumentNode.addChildElement('value', null, null).addTextNode(argPair.value == null ? '' : argPair.value);
        }

           
        //crafter is set up to first create an empty node with a type and name, and save it, and then
        //have the user bring up the property page to flesh it out with type-specific data.
        //if you try to dothat with External Connection it won't save because it doesn't start out with a 
        //valid action. Fixing this will require substantial UI changes, so for now, we're just going to
        //jack a temporary apex action in there. in fact we're going to create that action at the bottom of this file
        System.debug('before actualNode');
        if (actualNode.action == ''){
            System.debug('inside of actualNode');
            actualNode.action = 'Placeholder';
        }
        if (actualNode.type == ''){
            actualNode.type = 'APEX';
        }
        if (actualNode.description == ''){
            result.getChildElement('description',null).addTextNode('Sweden mandates a description in every actionContext');
        }


        result.addChildElement('action', null, null).addTextNode(actualNode.action);
        result.addChildElement('type', null, null).addTextNode(actualNode.type);
        
        
        String name = 'foo';
        String value= 'bar';
        Dom.XmlNode curArgument = result.addChildElement('argument', null, null);
        curArgument.addChildElement('name', null, null).addTextNode(name);
        curArgument.addChildElement('value', null, null).addTextNode(value);

        
        //the BaseNode adds a ParentNode element because when it was built, all nodes have one. But this node does not, so remove it
        Dom.XmlNode superfluousParent = result.getChildElement('parentNode',null);
        result.removeChild(superfluousParent);


        return result;
    }


    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new ExternalConnectionNode();
        }
        return prototypeNode;
    }
}
