public with sharing class RecordJoinNodeXmlConverter extends BaseNodeXmlConverter{

	private RecordJoinNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        RecordJoinNode result = (RecordJoinNode)super.convertXmlToNode(node, xmlNamespace); 
        if (result == null) {
            return null;
        }

        for (Dom.XMLNode child : node.getChildElements()) {
            String childName = child.getName();


            if (childName == 'field') {
                result.field = child.getText();
            } else 
            if (childName == 'object') {
                result.incomingObject = child.getText();
            } else
            if (childName == 'filterColumn') {
                result.filterColumn = child.getText();
            } else
            if (childName == 'filterValue') {
                result.filterValue = child.getText();
            } else
            if (childName == 'joinColumn') {
                result.joinColumn = child.getText();
            } 

        }     
        return result;
    }

    protected override BaseNode createNewNode() { return new RecordJoinNode(); }

    public override Dom.XmlNode convertNodeToXml(BaseNode node) {
        Dom.XmlNode result = super.convertNodeToXml(node);
        if (result == null) {
            return null;
        }

        RecordJoinNode actualNode = (RecordJoinNode)node;

        result.addChildElement('field', null, null).addTextNode(actualNode.field == null ? '' : actualNode.field);
		result.addChildElement('object', null, null).addTextNode(actualNode.incomingObject == null ? '' : actualNode.incomingObject);
		result.addChildElement('filterValue', null, null).addTextNode(actualNode.filterValue == null ? '' : actualNode.filterValue);
		result.addChildElement('filterColumn', null, null).addTextNode(actualNode.filterColumn == null ? '' : actualNode.filterColumn);
		result.addChildElement('joinColumn', null, null).addTextNode(actualNode.joinColumn == null ? '' : actualNode.joinColumn);

        return result;
    }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new RecordJoinNode();
        }
        return prototypeNode;
    }
    
}
