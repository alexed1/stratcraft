public with sharing class CriterionController {

	@AuraEnabled
	public static ObjectDescription[] getAvailableObjects(){
		Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
		List<ObjectDescription> result = new List<ObjectDescription>();
		List<String> entities = new List<String>(schemaMap.keySet());
		for(String name : entities)
		{
			DescribeSObjectResult objectDescribeResult = schemaMap.get(name).getDescribe();
			// System.debug('Name: ' + name.rightPad(20)
			// 	+ '. Accessible: ' + objectDescribeResult.isAccessible()
			// 	+ '. Createable: ' + objectDescribeResult.isCreateable()
			// 	+ '. Custom: ' + objectDescribeResult.isCustom()
			// 	+ '. CustomSetting: ' + objectDescribeResult.isCustomSetting()
			// 	+ '. Deletable: ' + objectDescribeResult.isDeletable()
			// 	+ '. DeprecatedAndHidden: ' + objectDescribeResult.isDeprecatedAndHidden()
			// 	+ '. FeedEnabled: ' + objectDescribeResult.isFeedEnabled()
			// 	+ '. Mergeable: ' + objectDescribeResult.isMergeable()
			// 	+ '. MruEnabled: ' + objectDescribeResult.isMruEnabled()
			// 	+ '. Queryable: ' + objectDescribeResult.isQueryable()
			// 	+ '. Searchable: ' + objectDescribeResult.isSearchable()
			// 	+ '. Undeletable: ' + objectDescribeResult.isUndeletable()
			// 	+ '. Updateable: ' + objectDescribeResult.isUpdateable());
			if (!objectDescribeResult.isAccessible()
			  || !objectDescribeResult.isQueryable()
			  || !objectDescribeResult.isSearchable()
			  || !(objectDescribeResult.isCreateable() || objectDescribeResult.isUpdateable())) {
				continue;
			}
			ObjectDescription objectDescription = new ObjectDescription(objectDescribeResult.getName(), objectDescribeResult.getLabel());
			Map<String, Schema.SObjectField> fields = objectDescribeResult.fields.getMap();
			for (String key : fields.keySet())
			{
				DescribeFieldResult field = fields.get(key).getDescribe();
				objectDescription.fields.add(new ObjectFieldDescription(field.getName(), field.getLabel()));
			}
			result.add(objectDescription);
		}
		return result;
	} 
}
