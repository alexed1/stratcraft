@isTest
public class StrategyXmlConverterTest {
    //XML-to-Strategy
    @isTest
    public static void convertXmlToStrategy_WhenXmlIsInvalid_Fails() {
        Strategy strategy = StrategyXmlConverter.convertXmlToStrategy(FixturesXml.InvalidStrategyXml);
        System.assertEquals(null, strategy.name, 'Name must be null');
        System.assertEquals(null, strategy.description, 'Description must be null');
        System.assertEquals(null, strategy.masterLabel, 'Master label must be null');
        System.assertEquals(1, strategy.notification.errors.size(), 'Failed strategy must contain an error');
        System.assert(strategy.notification.errors[0].startsWith('Encountered premature end of XML'), 'Error text mismatches');
    }

    @isTest
    public static void convertXmlToStrategy_WhenXmlDoesntContainChildNodes_StrategyPropertiesAreSet() {
        Strategy strategy = StrategyXmlConverter.convertXmlToStrategy(FixturesXml.EmptyStrategyXml);
        System.assertEquals('Name', strategy.name, 'Name mismatches');
        System.assertEquals('Description', strategy.description, 'Description mismatches');
        System.assertEquals('MasterLabel', strategy.masterLabel, 'Master label mismatches');
        System.assertEquals(0, strategy.nodes.size(), 'Empty strategy must not contain any node');
    }

    @isTest
    public static void convertXmlToStrategy_WhenXmlContainsNode_NodePropertiesAreSet() {
        Strategy strategy = StrategyXmlConverter.convertXmlToStrategy(FixturesXml.UnionNodeStrategyXml);
        System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain only one node');
        BaseNode node = strategy.nodes[0];
        System.assertEquals('RootNode', node.name, 'Name mismatches');
        System.assertEquals('Description', node.description, 'Description mismatches');
        System.assertEquals('', node.parentNodeName, 'Parent node name for root node must be null');
    }

    @isTest
    public static void convertXmlToStrategy_WhenXmlContainsFilterNodes_NodePropertiesAreSet() {
        Strategy strategy = StrategyXmlConverter.convertXmlToStrategy(FixturesXml.FilterNodeStrategyXml);
        System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one nodes');
        FilterNode node = (FilterNode)strategy.nodes[0];
        System.assert(node.removeDuplicates, '"Remove duplicates" field value mismatches');
        System.assertEquals('Expression', node.expression, '"Expression" field value mismatches');
    }

    @isTest
    public static void convertXmlToStrategy_WhenXmlContainsIfNodes_NodePropertiesAreSet() {
        Strategy strategy = StrategyXmlConverter.convertXmlToStrategy(FixturesXml.IfNodeStrategyXml);
        System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one nodes');
        IfNode node = (IfNode)strategy.nodes[0];
        System.assert(node.removeDuplicates, '"Remove duplicates" field value mismatches');
        System.assert(node.onlyFirstMatch, '"Only first match" field value mismatches');
        System.assertEquals(1, node.branches.size(), 'Node must contain one branch');
        IfBranch branch = node.branches[0];
        System.assertEquals('Child', branch.child, 'Branch "Child" field value mismatches');
        System.assertEquals('Expression', branch.expression, 'Branch "Expression" field value mismatches');
    }

    @isTest
    public static void convertXmlToStrategy_WhenXmlContainsRecommendationLimitNodes_NodePropertiesAreSet() {
        Strategy strategy = StrategyXmlConverter.convertXmlToStrategy(FixturesXml.RecommendationLimitNodeStrategyXml);
        System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one nodes');
        RecommendationLimitNode node = (RecommendationLimitNode)strategy.nodes[0];
        System.assert(node.removeDuplicates, '"Remove duplicates" field value mismatches');
        System.assertEquals(1, node.filterModes.size(), 'Node must contain one filter mode');
        System.assertEquals('Filter', node.filterModes[0], 'Filter mode mistmatches');
        System.assertEquals(1, node.maxRecommendationCount, '"Max recommendation count" field value mistmatches');
        System.assertEquals(2, node.lookbackDuration, '"Lookback duration" field value mistmatches');
    }

    @isTest
    public static void convertXmlToStrategy_WhenXmlContainsSoqlLoadNode_NodePropertiesAreSet() {
        Strategy strategy = StrategyXmlConverter.convertXmlToStrategy(FixturesXml.SoqlLoadNodeStrategyXml);
        System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain only one node');
        SoqlLoadNode node = (SoqlLoadNode)strategy.nodes[0];
        System.assertEquals('SOQL', node.soql, '"SOQL" field value mismatches');
        System.assertEquals('FieldName', node.fieldNameRemapping, '"Field name remapping" field value mismatches');
    }

    @isTest
    public static void convertXmlToStrategy_WhenXmlContainsUnionNodes_NodePropertiesAreSet() {
        Strategy strategy = StrategyXmlConverter.convertXmlToStrategy(FixturesXml.UnionNodeStrategyXml);
        System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one node');
        UnionNode node = (UnionNode)strategy.nodes[0];
        System.assert(node.removeDuplicates, '"Remove duplicates" field value mismatches');
    }

    @isTest
    public static void convertXmlToStrategy_Always_UnescapesXmlSymbols() {
        Strategy strategy = StrategyXmlConverter.convertXmlToStrategy(FixturesXml.SpecialSymbolsStrategyXml);
        System.assertEquals('<>&"\'', strategy.name);
        System.assertEquals('<>&"\'', strategy.masterLabel);
        System.assertEquals('<>&"\'', strategy.description);
    }

    //Strategy-to-XML

    @isTest
    public static void convertStrategyToXml_Always_EscapesXmlSymbols() {
        String xml = StrategyXmlConverter.convertStrategyToXml(FixturesStrategy.SpecialSymbolsStrategy());
        Dom.Document document = new Dom.Document();
        document.load(xml);
        Dom.XmlNode root = document.getRootElement();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        Dom.XmlNode name = root.getChildElement('recommendationStrategyName', xmlNamespace);
        System.assertEquals('&lt;&gt;&amp;&quot;&apos;', name.getText(), 'Name of the strategy mismatches');
        Dom.XmlNode description = root.getChildElement('description', xmlNamespace);
        System.assertEquals('&lt;&gt;&amp;&quot;&apos;', description.getText(), 'Description of the strategy mismatches');
        Dom.XmlNode masterLabel = root.getChildElement('masterLabel', xmlNamespace);
        System.assertEquals('&lt;&gt;&amp;&quot;&apos;', masterLabel.getText(), 'Master Label of the strategy mismatches');

    }

    @isTest
    public static void convertStrategyToXml_Always_SerializesStrategyProperties() {
        String xml = StrategyXmlConverter.convertStrategyToXml(FixturesStrategy.NoNodesStrategy());
        Dom.Document document = new Dom.Document();
        document.load(xml);
        Dom.XmlNode root = document.getRootElement();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        System.assertEquals('recommendationStrategy', root.getName(), 'Root element name mismatches');
        Dom.XmlNode name = root.getChildElement('recommendationStrategyName', xmlNamespace);
        System.assert(name != null, '"Name" node is not found');
        System.assertEquals('Name', name.getText(), 'Name of the strategy mismatches');
        Dom.XmlNode description = root.getChildElement('description', xmlNamespace);
        System.assert(description != null, '"Description" node is not found');
        System.assertEquals('Description', description.getText(), 'Description of the strategy mismatches');
        Dom.XmlNode masterLabel = root.getChildElement('masterLabel', xmlNamespace);
        System.assert(masterLabel != null, '"Master Label" node is not found');
        System.assertEquals('Master Label', masterLabel.getText(), 'Master Label of the strategy mismatches');
    }

    @isTest
    public static void convertStategyToXml_WhenStrategyContainsNode_NodePropertiesAreSet() {
        String xml = StrategyXmlConverter.convertStrategyToXml(FixturesStrategy.UnionNodeStrategy());
        Dom.Document document = new Dom.Document();
        document.load(xml);
        Dom.XmlNode root = document.getRootElement();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        Dom.XmlNode node = root.getChildElement('union', xmlNamespace);
        System.assert(node != null, 'Node is node found');
        Dom.XmlNode name = node.getChildElement('name', xmlNamespace);
        System.assert(name != null, '"Name" node is not found');
        System.assertEquals('Name', name.getText(), 'Name of the node mismatches');

        Dom.XmlNode description = node.getChildElement('description', xmlNamespace);
        System.assert(description != null, '"Description" node is not found');
        System.assertEquals('Description', description.getText(), 'Description of the node mismatches');

        Dom.XmlNode parentNode = node.getChildElement('parentNode', xmlNamespace);
        System.assert(parentNode != null, '"Parent Node" node is not found');
        System.assert(String.isBlank(parentNode.getText()), 'Parent Node of the node mismatches');
    }

    @isTest
    public static void convertStategyToXml_WhenStrategyContainsFilterNode_NodePropertiesAreSet() {
        String xml = StrategyXmlConverter.convertStrategyToXml(FixturesStrategy.FilterNodeStrategy());
        Dom.Document document = new Dom.Document();
        document.load(xml);
        Dom.XmlNode root = document.getRootElement();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        Dom.XmlNode node = root.getChildElement('filter', xmlNamespace);
        System.assert(node != null, 'Node is node found');
        Dom.XmlNode removeDuplicates = node.getChildElement('removeDuplicates', xmlNamespace);
        System.assert(removeDuplicates != null, '"Remove Duplicates" node is not found');
        System.assertEquals('true', removeDuplicates.getText(), 'Remove Duplicates of the node mismatches');

        Dom.XmlNode expression = node.getChildElement('expression', xmlNamespace);
        System.assert(expression != null, '"Expression" node is not found');
        System.assertEquals('Expression', expression.getText(), 'Expression of the node mismatches');
    }

    @isTest
    public static void convertStategyToXml_WhenStrategyContainsIfNode_NodePropertiesAreSet() {
        String xml = StrategyXmlConverter.convertStrategyToXml(FixturesStrategy.IfNodeStrategy());
        Dom.Document document = new Dom.Document();
        document.load(xml);
        Dom.XmlNode root = document.getRootElement();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        Dom.XmlNode node = root.getChildElement('if', xmlNamespace);
        System.assert(node != null, 'Node is node found');
        Dom.XmlNode removeDuplicates = node.getChildElement('removeDuplicates', xmlNamespace);
        System.assert(removeDuplicates != null, '"Remove Duplicates" node is not found');
        System.assertEquals('true', removeDuplicates.getText(), 'Remove Duplicates of the node mismatches');

        
        Dom.XmlNode onlyFirstMatch = node.getChildElement('onlyFirstMatch', xmlNamespace);
        System.assert(onlyFirstMatch != null, '"Only First Match" node is not found');
        System.assertEquals('true', onlyFirstMatch.getText(), 'Only First Match of the node mismatches');

        Dom.XmlNode branch = node.getChildElement('branch', xmlNamespace);
        System.assert(branch != null, '"Branch" node is not found');

        Dom.XmlNode child = branch.getChildElement('child', xmlNamespace);
        System.assert(child != null, '"Child" node is not found');
        System.assertEquals('Child', child.getText(), 'Child of the node mismatches');

        Dom.XmlNode expression = branch.getChildElement('expression', xmlNamespace);
        System.assert(expression != null, '"Expression" node is not found');
        System.assertEquals('Expression', expression.getText(), 'Expression of the node mismatches');
    }

    @isTest
    public static void convertStategyToXml_WhenStrategyContainsRecommendationLimitNode_NodePropertiesAreSet() {
        String xml = StrategyXmlConverter.convertStrategyToXml(FixturesStrategy.RecommendationLimitStrategy());
        Dom.Document document = new Dom.Document();
        document.load(xml);
        Dom.XmlNode root = document.getRootElement();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        Dom.XmlNode node = root.getChildElement('recommendationLimit', xmlNamespace);
        System.assert(node != null, 'Node is node found');
        Dom.XmlNode removeDuplicates = node.getChildElement('removeDuplicates', xmlNamespace);
        System.assert(removeDuplicates != null, '"Remove Duplicates" node is not found');
        System.assertEquals('true', removeDuplicates.getText(), 'Remove Duplicates of the node mismatches');

        Dom.XmlNode maxRecommendationCount = node.getChildElement('maxRecommendationCount', xmlNamespace);
        System.assert(maxRecommendationCount != null, '"Max Recommendation Count" node is not found');
        System.assertEquals('2', maxRecommendationCount.getText(), 'Max Recommendation Count of the node mismatches');

        Dom.XmlNode lookbackDuration = node.getChildElement('lookbackDuration', xmlNamespace);
        System.assert(lookbackDuration != null, '"Lookback Duration" node is not found');
        System.assertEquals('1', lookbackDuration.getText(), 'Lookback Duration of the node mismatches');

        Dom.XmlNode filterMode = node.getChildElement('filterMode', xmlNamespace);
        System.assert(filterMode != null, '"Filter Mode" node is not found');
        System.assertEquals('Filter Mode', filterMode.getText(), 'Filter Mode of the node mismatches');
    }

    @isTest
    public static void convertStategyToXml_WhenStrategyContainsSoqlLoadNode_NodePropertiesAreSet() {
        String xml = StrategyXmlConverter.convertStrategyToXml(FixturesStrategy.SoqlLoadStrategy());
        Dom.Document document = new Dom.Document();
        document.load(xml);
        Dom.XmlNode root = document.getRootElement();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        Dom.XmlNode node = root.getChildElement('soqlLoad', xmlNamespace);
        System.assert(node != null, 'Node is node found');

        Dom.XmlNode soql = node.getChildElement('soql', xmlNamespace);
        System.assert(soql != null, '"soql" node is not found');
        System.assertEquals('Soql', soql.getText(), 'soql of the node mismatches');

        Dom.XmlNode fieldNameRemapping = node.getChildElement('fieldNameRemapping', xmlNamespace);
        System.assert(fieldNameRemapping != null, '"Field Name Remapping" node is not found');
        System.assertEquals('Field Name Remapping', fieldNameRemapping.getText(), 'Field Name Remapping of the node mismatches');
    }

    @isTest
    public static void convertStategyToXml_WhenStrategyContainsUnionNode_NodePropertiesAreSet() {
        String xml = StrategyXmlConverter.convertStrategyToXml(FixturesStrategy.UnionNodeStrategy());
        Dom.Document document = new Dom.Document();
        document.load(xml);
        Dom.XmlNode root = document.getRootElement();
        String xmlNamespace = 'http://soap.sforce.com/2006/04/metadata';
        Dom.XmlNode node = root.getChildElement('union', xmlNamespace);
        System.assert(node != null, 'Node is not found');

        Dom.XmlNode removeDuplicates = node.getChildElement('removeDuplicates', xmlNamespace);
        System.assert(removeDuplicates != null, '"Remove Duplicates" node is not found');
        System.assertEquals('true', removeDuplicates.getText(), 'Remove Duplicates of the node mismatches');
    }
}
