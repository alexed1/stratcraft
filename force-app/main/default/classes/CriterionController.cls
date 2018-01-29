public with sharing class CriterionController {

  
	@AuraEnabled
   public static ObjectDescription[] getAvailableObjects(){

        List<ObjectDescription> result = new List<ObjectDescription>();
        List<AggregateResult> desirableObjectTypes = [SELECT SObjectType From ObjectPermissions Group By SObjectType];
        Map<String, Schema.SObjectType> allObjectTypes = Schema.getGlobalDescribe();


        for (Integer i; i < desirableObjectTypes.size(); i++)
        {
            string objTypeName = (string)desirableObjectTypes[i].get('SObjectType');

            Schema.SObjectType objTyp = allObjectTypes.get(objTypeName.toLowerCase());
            DescribeSObjectResult objDescription = objTyp.getDescribe();
            string objLabel = objDescription.getLabel();
            string apiName = objDescription.getName();

            ObjectDescription resultingObject = new ObjectDescription(apiName, objLabel);
            Map<String, Schema.SObjectField> fields = objDescription.fields.getMap();
                for (String key : fields.keySet())
                {
                    string fieldLabel = fields.get(key).getDescribe().getLabel();
                    string fieldName = key;
                    resultingObject.fields.put(fieldName, fieldLabel);
                }

            result.Add(resultingObject);
        }
        
        return result;
    }
}
