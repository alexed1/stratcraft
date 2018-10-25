public with sharing class CriterionController {



@AuraEnabled
public static ObjectDescription[] getPropositionFields(){
	Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
	List<ObjectDescription> result = new List<ObjectDescription>();
	List<String> entities = new List<String>(schemaMap.keySet());
	System.debug('CriterionController entities:'+entities.size());
	for(String name : entities)
	{
		if (name != 'Proposition')
			continue;

		DescribeSObjectResult objectDescribeResult = schemaMap.get(name).getDescribe();
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
				if (fieldName == null) {
					continue;
				}
				objectDescription.fieldList.add(new ObjectFieldDescription(fieldName, fieldLabel, relationshipTypeName, true, null));
			} else {
				objectDescription.fieldList.add(new ObjectFieldDescription(fieldName, fieldLabel, fieldType.name(), false, null));
			}
		}
		result.add(objectDescription);
		break;
	}
	return result;
}


@AuraEnabled
public static ObjectDescription[] getApexActions(List<String> actionNames, String sessionId) {
	List<ObjectDescription> result = new List<ObjectDescription>();
	System.debug('CriterionController getApexActions actionNames.size'+actionNames.size());
	for (String actionName: actionNames) {
		System.debug('CriterionController getApexActions actionName:'+actionName);
		HTTP http = new HTTP();
		HTTPRequest hres = new HTTPRequest();
		String endpoint = URL.getSalesforceBaseUrl().toExternalForm() + '/services/data/v44.0/actions/custom/apex/' + actionName;
		System.debug(endpoint);
		hres.setEndpoint(endpoint);
		hres.setMethod('GET');
		hres.setHeader('Authorization','Bearer ' + sessionId);
		HttpResponse response = http.send(hres);
		String stringResponse = response.getBody();
		//If response is array, then the action doesn't exist
		if (stringResponse.startsWith('[')) {
			continue;
		}
		Map<String, Object> parsedJson = (Map<String,Object>)JSON.deserializeUntyped(response.getBody());
		ObjectDescription action = new ObjectDescription(actionName, (String)parsedJson.get('label'));
		List<Object> outputs = (List<Object>)parsedJson.get('outputs');
		for (Object outputObj: outputs) {
			Map<String, Object> output = (Map<String, Object>)outputObj;
			ObjectFieldDescription field = new ObjectFieldDescription(
				(String)output.get('name'),
				(String)output.get('label'),
				(String)output.get('type'),
				false,
				null);
			action.fieldList.add(field);
		}
		result.add(action);
	}
	return result;
}
}
