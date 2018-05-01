public with sharing class CriterionController {

@AuraEnabled
public static ObjectDescription[] getAvailableObjects(){
	List<ObjectDescription> result = new List<ObjectDescription>();
	List<AggregateResult> desirableObjectTypes = [SELECT SObjectType From ObjectPermissions Group By SObjectType order by SObjectType];
	Map<String, Schema.SObjectType> allObjectTypes = Schema.getGlobalDescribe();

	for (AggregateResult aggrResult : desirableObjectTypes)
	{
		Object objTypeName = aggrResult.get('SObjectType');
		string objTypeNameStr = (string)objTypeName;
		system.debug(objTypeNameStr);


		ObjectDescription resultingObject = ExtractObjectInfo(allObjectTypes, objTypeNameStr);
		if (resultingObject!=null)
			result.Add(resultingObject);
	}

	return result;
}

public static ObjectDescription ExtractObjectInfo(Map<String, Schema.SObjectType> allObjectTypes, String objTypeNameStr){

	Schema.SObjectType objTyp = allObjectTypes.get(objTypeNameStr.toLowerCase());

	if (objTyp == null)
		return null;


	DescribeSObjectResult objDescription = objTyp.getDescribe();
	string objLabel = objDescription.getLabel();
	string apiName = objDescription.getName();

	ObjectDescription resultingObject = new ObjectDescription(apiName, objLabel);
	Map<String, Schema.SObjectField> fields = objDescription.fields.getMap();

	String properties = '';
	for (String key : fields.keySet())
	{
		system.debug(key);
		DescribeFieldResult field = fields.get(key).getDescribe();
		string fieldLabel = field.getLabel();
		string fieldName = field.getName();
		properties += '{name:"'+fieldName+'", label:"'+fieldLabel+'"},';
		resultingObject.fields.add(new ObjectFieldDescription(fieldName, fieldLabel));
	}

	system.debug(properties);

	return resultingObject;
}
}
