public with sharing class RecordJoinNodeXmlConverter extends BaseNodeXmlConverter{

	private RecordJoinNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        RecordJoinNode result = (RecordJoinNode)super.convertXmlToNode(node, xmlNamespace); 
        if (result == null) {
            return null;
        }

        for (Dom.XMLNode child : node.getChildElements()) {
            String childName = child.getName();
            String value = child.getText();
            value = String.isBlank(value) ? '' : value.unescapeXml();
            if (childName == 'field') {
                result.field = value;
            } else 
            if (childName == 'object') {
                result.incomingObject = value;
            } else
            if (childName == 'filterColumn') {
                result.filterColumn = value;
            } else
            if (childName == 'filterValue') {
                result.filterValue = value;
            } else
            if (childName == 'joinColumn') {
                result.joinColumn = value;
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

        result.addChildElement('field', null, null).addTextNode(actualNode.field == null ? '' : actualNode.field.escapeXml());
		result.addChildElement('object', null, null).addTextNode(actualNode.incomingObject == null ? '' : actualNode.incomingObject.escapeXml());
		result.addChildElement('filterValue', null, null).addTextNode(actualNode.filterValue == null ? '' : actualNode.filterValue.escapeXml());
		result.addChildElement('filterColumn', null, null).addTextNode(actualNode.filterColumn == null ? '' : actualNode.filterColumn.escapeXml());
		result.addChildElement('joinColumn', null, null).addTextNode(actualNode.joinColumn == null ? '' : actualNode.joinColumn.escapeXml());

        return result;
    }

    public override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new RecordJoinNode();
        }
        return prototypeNode;
    }
    
}
