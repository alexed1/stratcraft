public with sharing class SortNodeJsonConverter extends BaseNodeJsonConverter{
   

    private SortNode prototypeNode;

    public override BaseNode convertJsonToNode(Map<String, Object> jsonNode) {
        System.debug('entering convertJsonToNode in SortNodeJsonConverter.cls');
        System.debug ('json Node is: ' + jsonNode);
        SortNode result = (SortNode)super.convertJsonToNode(jsonNode); 
        System.debug('result of super call is:' + result);
        if (result == null) {
            return null;
        }
        result.myLimit = jsonNode.containsKey('limit') ? (String)jsonNode.get('limit') : '';
    

        if (jsonNode.containsKey('sortKeys')) {
            for (Object childObj : (List<Object>)jsonNode.get('sortKeys')) {
                Map<String, Object> child = (Map<String, Object>)childObj;
                SortKey sortKey = new SortKey();
                sortKey.name = (String)child.get('name');
                sortKey.nullsFirst = String.valueOf(child.get('nullsFirst'));
                sortKey.order = (String)child.get('order');
                result.sortKeys.Add(sortKey);
            }
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
