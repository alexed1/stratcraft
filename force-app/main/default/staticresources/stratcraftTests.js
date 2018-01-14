/**
 * This test suite contains examples that illustrate reusable patterns for testing
 * your custom Lightning components.
 *
 * These tests are written using the [Jasmine framework](https://jasmine.github.io/2.1/introduction).
 * They're run in the Lightning Testing Service using a wrapper, which you can find
 * in jasmineboot.js, in the same repository as this test suite.
 *
 * Note that Jasmine uses "spec" as its name for a test. We use their terminology here
 * for consistency with their documentation.
 */
describe("Lightning Component Testing Examples", function(){
    afterEach(function() {
        // Each spec (test) renders its components into the same div,
        // so we need to clear that div out at the end of each spec.
        $T.clearRenderedTestComponents();
    });

    /**
     * Component under test: 'c:egRenderElement':
     * This spec creates a component, adds it to the body, waits for the rendering to complete,
     * and then ensures that the expected content has been added to the DOM.
     * NOTE: The spec and the component under test are in same locker (same namespace),
     *       so the spec is able to see the DOM owned by the component.
     */

    /**
     * Component under test: 'c:egComponentMethod'
     * This spec validates that calling a method on the component's public interface
     * causes the expected state change.
     */
    describe('c:stratCraft', function() {
        it("tests for the presence of a value", function(done) {
            $T.createComponent("c:stratCraft", null)
            .then(function(component) {
                //component.sampleMethod();
                expect(component.get("v.foo")).toBe("foo");
                done();
            }).catch(function(e) {
                done.fail(e);
            });
        });

        
    });



});
