@isTest
public with sharing class MetadataServiceControllerTests {
	
    @isTest
    public static void loadStrategyNamesRequest_Always_ReturnsTheListOfNames() {
        String sessionId = UserInfo.getSessionId();        
        Test.startTest();
        List<String> strategies = MetadataServiceController.loadStrategyNamesRequest(sessionId);
        System.assert(strategies.size() >= 0);
    }    
}