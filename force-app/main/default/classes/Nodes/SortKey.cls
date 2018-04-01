public with sharing class SortKey {
   
    @AuraEnabled public String name { get; set; }
	@AuraEnabled public String nullsFirst { get; set; }
    @AuraEnabled public String order { get; set; }
}
