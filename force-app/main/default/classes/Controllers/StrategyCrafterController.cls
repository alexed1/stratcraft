//this controller is used to convert xml to Strategy object and back

public class StrategyCrafterController {
@AuraEnabled
public static ObjectDescription[] getTypeList() {
	return CriterionController.getSchema(true);
}

}