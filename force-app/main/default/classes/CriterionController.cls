public with sharing class CriterionController {

    @AuraEnabled
    public static ObjectDescription[] getAvailableObjects(){
        List<ObjectDescription> result = new List<ObjectDescription>();
        List<AggregateResult> desirableObjectTypes = [SELECT SObjectType From ObjectPermissions Group By SObjectType];
        Map<String, Schema.SObjectType> allObjectTypes = Schema.getGlobalDescribe();
        for (AggregateResult aggrResult : desirableObjectTypes)
        {
            Object objTypeName = aggrResult.get('SObjectType');
            string objTypeNameStr = (string)objTypeName;
            system.debug(objTypeNameStr);
            
            Schema.SObjectType objTyp = allObjectTypes.get(objTypeNameStr.toLowerCase());
           	
            if (objTyp == null)
                continue;
            
            DescribeSObjectResult objDescription = objTyp.getDescribe();
            string objLabel = objDescription.getLabel();
            string apiName = objDescription.getName();
       
            ObjectDescription resultingObject = new ObjectDescription(apiName, objLabel);
            Map<String, Schema.SObjectField> fields = objDescription.fields.getMap();
                for (String key : fields.keySet())
                {
                    string fieldLabel = fields.get(key).getDescribe().getLabel();
                    string fieldName = key;
                    resultingObject.fields.add(new ObjectFieldDescription(fieldName, fieldLabel));
                }
			system.debug(resultingObject);
            result.Add(resultingObject);
        }
        
        return result;
    }
}
