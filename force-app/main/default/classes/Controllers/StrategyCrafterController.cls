//this controller is used to convert xml to Strategy object and back

public class StrategyCrafterController {

@AuraEnabled(cacheable=true)
public static List<string> getSchemaNames(Boolean ifMode){
	Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
	List<String> entities = new List<String>(schemaMap.keySet());
	List<String> result = new List<String>();
	System.debug('CriterionController entities:'+entities.size());
	for(String name : entities)
	{
		System.debug('CriterionController processing enitty:'+name+' '+entities.indexOf(name));
		result.add(name);
	}
	return result;
}


@AuraEnabled(cacheable=true)
public static ObjectDescription[] getTypesPage(List<string> types){
	Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
	List<ObjectDescription> result = new List<ObjectDescription>();
	for(String name : types)
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

			if (!field.isAccessible()
			    || !(field.isCreateable() || field.isUpdateable())) {
				continue;
			}
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
				objectDescription.fieldList.add(new ObjectFieldDescription(fieldName,  fieldLabel, relationshipTypeName, true, relationshipName));
			} else {
				objectDescription.fieldList.add(new ObjectFieldDescription(fieldName, fieldLabel, fieldType.name(), false, null));
			}
		}
		result.add(objectDescription);
	}
	return result;
}


}