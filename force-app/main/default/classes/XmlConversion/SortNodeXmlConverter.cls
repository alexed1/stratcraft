public with sharing class SortNodeXmlConverter extends BaseNodeXmlConverter{
    private SortNode prototypeNode;

    public override BaseNode convertXmlToNode(Dom.XmlNode node, String xmlNamespace) {
        SortNode result = (SortNode)super.convertXmlToNode(node, xmlNamespace); 
        if (result == null) {
            return null;
        }
     
        
        for (Dom.XMLNode child : node.getChildElements()) {
            String childName = child.getName();
            if (childName == 'limit') {
                String value = child.getText();
                result.myLimit = String.isBlank(value) ? '' : value.unescapeXml();
            }

            if (childName == 'field') {
                SortKey sortKey = new SortKey();
                String name = child.getChildElement('name', xmlNamespace).getText();
                sortKey.name = String.isBlank(name) ? '' : name.unescapeXml();
                String nullsFirst = child.getChildElement('nullsFirst', xmlNamespace).getText();
                sortKey.nullsFirst = String.isBlank(nullsFirst) ? '' : nullsFirst.unescapeXml();
                String order = child.getChildElement('order', xmlNamespace).getText();
                sortKey.order = String.isBlank(order) ? '' : order.unescapeXml();
                result.sortKeys.Add(sortKey);
            } 
        }        
        return result;
    }

    public override Dom.XmlNode convertNodeToXml(BaseNode node) {
        Dom.XmlNode result = super.convertNodeToXml(node);
        if (result == null) {
            return null;
        }


        SortNode actualNode = (SortNode)node;

        //defaults because the system can't handle it otherwise
        if (actualNode.myLimit == ''){
            actualNode.myLimit = '50';
        }



        result.addChildElement('limit', null, null).addTextNode(actualNode.myLimit);

        for (SortKey sortKey : actualNode.sortKeys) {
            Dom.XmlNode sortNode = result.addChildElement('field', null, null);
            sortNode.addChildElement('name', null, null).addTextNode(sortKey.name == null ? '' : sortKey.name.escapeXml());
            //Default 'nullFirst' to '1' or 'true' as otherwise strategy save fails
            sortNode.addChildElement('nullsFirst', null, null).addTextNode(sortKey.nullsFirst == null ? '1' : sortKey.nullsFirst.escapeXml());
            sortNode.addChildElement('order', null, null).addTextNode(sortKey.order == null ? '' : sortkey.order.escapeXml());
        }
        return result;
    }

    protected override BaseNode createNewNode() { return new SortNode(); }

    protected override BaseNode getPrototypeNode() {
        if (prototypeNode == null) {
            prototypeNode = new SortNode();
        }
        return prototypeNode;
    }
}
