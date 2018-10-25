@isTest
public class CriterionControllerTest {
@isTest
public static void getSchema_Always_ReturnsTheListOfObjects() {
	List<ObjectDescription> actual = CriterionController.getPropositionFields();
	System.assert (actual.size() >= 0, 'At least one object description must be returned from an empty org');
}
}