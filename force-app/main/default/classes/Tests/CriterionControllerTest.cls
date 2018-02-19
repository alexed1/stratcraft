@isTest
public class CriterionControllerTest {
	@isTest
    public static void getAvailableObjects_Always_ReturnsTheListOfObjects() {
        List<ObjectDescription> actual = CriterionController.getAvailableObjects();
        System.assert(actual.size() > 0, 'At least one object description must be returned from an empty org');
    }
}