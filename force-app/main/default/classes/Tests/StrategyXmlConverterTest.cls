@isTest
public class StrategyXmlConverterTest {
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
        System.assertEquals(1, strategy.nodes.size(), 'Strategy must contain one nodes');
        UnionNode node = (UnionNode)strategy.nodes[0];
        System.assert(node.removeDuplicates, '"Remove duplicates" field value mismatches');
    }
}
