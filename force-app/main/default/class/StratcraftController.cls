

public with sharing class StratcraftController {
    public StratcraftController() {

    }

    @auraEnabled
    public static string buildTree(string strategyXMLString){

    	System.debug('received strategyXMLString: ' + strategyXMLString);
    	return 'foo';
    }

   


}


