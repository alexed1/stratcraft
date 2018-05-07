public with sharing class FixturesXml {
    
    public static String InvalidStrategyXml = '<RecommendationStrategy /';

    public static String EmptyStrategyXml =
        '<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        + '<description>Description</description>'
        + '<masterLabel>MasterLabel</masterLabel>'
        + '<recommendationStrategyName>Name</recommendationStrategyName>'
        + '</RecommendationStrategy>';
        
    public static String SpecialSymbolsStrategyXml =
        '<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        + '<description>&lt;&gt;&amp;&quot;&apos;</description>'
        + '<masterLabel>&lt;&gt;&amp;&quot;&apos;</masterLabel>'
        + '<recommendationStrategyName>&lt;&gt;&amp;&quot;&apos;</recommendationStrategyName>'
        + '</RecommendationStrategy>';

    public static String UnionNodeStrategyXml = 
        '<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        + '<union>'
        + '<name>RootNode</name>'
        + '<description>Description</description>'
        + '<parentNode />'
        + '<removeDuplicates>true</removeDuplicates>'
        + '</union>'
        + '</RecommendationStrategy>';

    public static String FilterNodeStrategyXml =
        '<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        + '<filter>'
        + '<name>RootNode</name>'
        + '<description>Description</description>'
        + '<parentNode />'
        + '<removeDuplicates>true</removeDuplicates>'
        + '<expression>Expression</expression>'
        + '</filter>'
        + '</RecommendationStrategy>';

    public static String IfNodeStrategyXml =
        '<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        + '<if>'
        + '<name>RootNode</name>'
        + '<description>Description</description>'
        + '<parentNode />'
        + '<removeDuplicates>true</removeDuplicates>'
        + '<onlyFirstMatch>true</onlyFirstMatch>'
        + '<branch>'
        + '<child>Child</child>'
        + '<expression>Expression</expression>' 
        + '</branch>'
        + '</if>'
        + '</RecommendationStrategy>';

    public static String RecommendationLimitNodeStrategyXml =
        '<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        + '<recommendationLimit>'
        + '<name>RootNode</name>'
        + '<description>Description</description>'
        + '<parentNode />'
        + '<removeDuplicates>true</removeDuplicates>'
        + '<filterMode>Filter</filterMode>'
        + '<maxRecommendationCount>1</maxRecommendationCount>'
        + '<lookbackDuration>2</lookbackDuration>'
        + '</recommendationLimit>'
        + '</RecommendationStrategy>';

    public static String SoqlLoadNodeStrategyXml =
        '<RecommendationStrategy xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        + '<soqlLoad>'
        + '<name>RootNode</name>'
        + '<description>Description</description>'
        + '<parentNode />'
        + '<soql>SOQL</soql>'
        + '<fieldNameRemapping>FieldName</fieldNameRemapping>'
        + '</soqlLoad>'
        + '</RecommendationStrategy>';
}
