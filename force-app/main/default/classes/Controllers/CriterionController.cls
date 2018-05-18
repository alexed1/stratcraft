public with sharing class CriterionController {

	@AuraEnabled
	public static ObjectDescription[] getSchema(){
		Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
		List<ObjectDescription> result = new List<ObjectDescription>();
		List<String> entities = new List<String>(schemaMap.keySet());
		for(String name : entities)
		{
			DescribeSObjectResult objectDescribeResult = schemaMap.get(name).getDescribe();
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
				Schema.DisplayType fieldType = field.getType();
				String fieldName = field.getName();
				String fieldLabel = field.getLabel();
				String relationshipName = field.getRelationshipName();
				List<Schema.SObjectType> relationships = field.getReferenceTo();
				String relationshipTypeName = relationships.size() > 0 ? relationships[0].getDescribe().getName() : null;
				//For now we skip references that potentailly have multiple targets (e.g. OwnerId may be a reference to either User or Group)
				if (fieldType == Schema.DisplayType.REFERENCE) {
					if (relationships.size() > 1) {
						continue;
					}
					objectDescription.fieldList.add(new ObjectFieldDescription(relationshipName, fieldLabel, relationshipTypeName, true));
				} else {
					objectDescription.fieldList.add(new ObjectFieldDescription(fieldName, fieldLabel, fieldType.name(), false));
				}
			}
			result.add(objectDescription);
		}
		return result;
	} 
}
