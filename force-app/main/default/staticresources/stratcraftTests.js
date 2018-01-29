/**
 * These tests are written using the [Jasmine framework](https://jasmine.github.io/2.1/introduction).
 * They're run in the Lightning Testing Service using a wrapper, which you can find
 * in jasmineboot.js, in the same repository as this test suite.
 */

describe("c:stratCraft", function () {

    beforeEach(function () {
        //fix for jasmine sometimes failing to run tests at all with a callback timeout error
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    });

    afterEach(function () {
        // Each spec (test) renders its components into the same div,
        // so we need to clear that div out at the end of each spec.
        $T.clearRenderedTestComponents();
    });

    it("processes loaded strategy XML", function (done) {
        $T.createComponent("c:stratCraft", null)
            .then(function (component) {
                //#######SETUP########
                var testStrategyResult = { description: 'Test Strategy', masterLabel: 'SomeMasterLabel', name: 'testStrat1', nodes: [Object({ definition: '{removeDuplicates:true}', description: 'the root', name: 'RootNode', parentNodeName: '', type: '2' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'If payment is past due request payment else churn', name: 'IfPaymentPastDueElseChurnNode', parentNodeName: 'RootNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 222', name: '222', parentNodeName: 'IfPaymentPastDueElseChurnNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 333', name: '333', parentNodeName: 'RootNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 444', name: '444', parentNodeName: 'RootNode', type: '4' })] };
                var testStrategyXML = "<RecommendationStrategy xmlns=\"http://soap.sforce.com/2006/04/metadata\">    <description>Test Strategy</description>    <recommendationStrategyName>testStrat1</recommendationStrategyName>    <masterLabel>SomeMasterLabel</masterLabel>	<!-- Root -->	<strategyNode>		<name>RootNode</name>		<description>the root</description>		<parentNode></parentNode>		<type>2<!--Union--></type>		<definition>{ removeDuplicates: true }</definition>	</strategyNode>	<!-- Payment Past Due -->	<strategyNode>		<name>IfPaymentPastDueElseChurnNode</name>		<description>If payment is past due request payment else churn</description>		<parentNode>RootNode</parentNode>		<type>4<!--If--></type>		<definition>			{				expressions: {					\"LoadPpd\": \"$Record.Contact.Payment_Due_Date__c &lt; (TODAY() - 30)\",					\"LowCsatIfNode\": \"true\"},				onlyFirstMatch: true			}		</definition>	</strategyNode>			<strategyNode>		<name>222</name>		<description>This is node 222</description>		<parentNode>IfPaymentPastDueElseChurnNode</parentNode>		<type>4<!--If--></type>		<definition>			{				expressions: {					\"LoadPpd\": \"$Record.Contact.Payment_Due_Date__c &lt; (TODAY() - 30)\",					\"LowCsatIfNode\": \"true\"},				onlyFirstMatch: true			}		</definition>	</strategyNode>			<strategyNode>		<name>333</name>		<description>This is node 333</description>		<parentNode>RootNode</parentNode>		<type>4<!--If--></type>		<definition>			{				expressions: {					\"LoadPpd\": \"$Record.Contact.Payment_Due_Date__c &lt; (TODAY() - 30)\",					\"LowCsatIfNode\": \"true\"},				onlyFirstMatch: true			}		</definition>	</strategyNode>	<strategyNode>		<name>444</name>		<description>This is node 444</description>		<parentNode>RootNode</parentNode>		<type>4<!--If--></type>		<definition>			{				expressions: {					\"LoadPpd\": \"$Record.Contact.Payment_Due_Date__c &lt; (TODAY() - 30)\",					\"LowCsatIfNode\": \"true\"},				onlyFirstMatch: true			}		</definition>	</strategyNode></RecommendationStrategy>";
                component.set("v.strategyXML", testStrategyXML);

                //########ACT#########
                var cmpEvent = component.getEvent("xmlFileUploaded");
                cmpEvent.fire();

                //#######ASSERT#######
                setTimeout(function () {
                    //setting timeout since there is a $A.enqueAction call in treeNode
                    //and otherwise test runs asserts before proccessing is ended
                    expect(component.get("v.curStrat")).toEqual(testStrategyResult);
                    expect(component.get("v.curStrat")).toEqual(component.get("v.curStratCopy"));

                    done();
                }, 2000);

            }).catch(function (e) {
                done.fail(e);
            });
    });


    it("can update Property Page on node selection", function (done) {
        $T.createComponent("c:stratCraft", null)
            .then(function (component) {

                //#######SETUP########
                var testStrategyResult = { description: 'Test Strategy', masterLabel: 'SomeMasterLabel', name: 'testStrat1', nodes: [Object({ definition: '{removeDuplicates:true}', description: 'the root', name: 'RootNode', parentNodeName: '', type: '2' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'If payment is past due request payment else churn', name: 'IfPaymentPastDueElseChurnNode', parentNodeName: 'RootNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 222', name: '222', parentNodeName: 'IfPaymentPastDueElseChurnNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 333', name: '333', parentNodeName: 'RootNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 444', name: '444', parentNodeName: 'RootNode', type: '4' })] };
                component.set("v.curStrat", testStrategyResult);

                //########ACT#########
                $T.fireApplicationEvent("c:treeNodeSelectedEvent", { "name": "RootNode" });

                //#######ASSERT#######
                expect(component.find("propertyPage").get("v.curNode")).toBeDefined();
                expect(component.find("propertyPage").get("v.originalName")).toEqual("RootNode");

                done();

            }).catch(function (e) {
                done.fail(e);
            });
    });

    it("can save Node, update Name/ParentNode correctly and reset property page", function (done) {
        $T.createComponent("c:stratCraft", null)
            .then(function (component) {

                //#######SETUP########
                //1. load a strategy
                var testStrategy = { description: 'Test Strategy', masterLabel: 'SomeMasterLabel', name: 'testStrat1', nodes: [Object({ definition: '{removeDuplicates:true}', description: 'the root', name: 'RootNode', parentNodeName: '', type: '2' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'If payment is past due request payment else churn', name: 'IfPaymentPastDueElseChurnNode', parentNodeName: 'RootNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 222', name: '222', parentNodeName: 'IfPaymentPastDueElseChurnNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 333', name: '333', parentNodeName: 'RootNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 444', name: '444', parentNodeName: 'RootNode', type: '4' })] };
                //testStrategyResult - strategy with updated Name/ParentNode
                var testStrategyResult = { description: 'Test Strategy', masterLabel: 'SomeMasterLabel', name: 'testStrat1', nodes: [Object({ definition: '{removeDuplicates:true}', description: 'the root', name: 'RootNode', parentNodeName: '', type: '2' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'If payment is past due request payment else churn', name: 'IfPaymentPastDueElseChurnNode', parentNodeName: 'RootNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 222', name: '1337', parentNodeName: '333', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 333', name: '333', parentNodeName: 'RootNode', type: '4' }), Object({ definition: '{expressions:{"LoadPpd":"$Record.Contact.Payment_Due_Date__c<(TODAY()-30)","LowCsatIfNode":"true"},onlyFirstMatch:true}', description: 'This is node 444', name: '444', parentNodeName: 'RootNode', type: '4' })] };
                component.set("v.curStrat", testStrategy);
                var treeItems = [{ "name": "RootNode", "label": "RootNode", "items": [{ "name": "IfPaymentPastDueElseChurnNode", "label": "IfPaymentPastDueElseChurnNode", "items": [{ "name": "222", "label": "222", "items": [], "href": null, "expanded": false }], "href": null, "expanded": true }, { "name": "333", "label": "333", "items": [], "href": null, "expanded": false }, { "name": "444", "label": "444", "items": [], "href": null, "expanded": false }], "href": null, "expanded": true }];
                component.set("v.treeItems", treeItems);
                //2. selecting a node
                $T.fireApplicationEvent("c:treeNodeSelectedEvent", { "name": "222" });
                //3. changing its name and parent
                var propertyPage = component.find("propertyPage");
                propertyPage.set("v.curNode.name", "1337");
                propertyPage.set("v.curNode.parentNodeName", "333");


                //########ACT#########
                $T.fireApplicationEvent("c:propertyPageSaveRequestEvent", {
                    "changedStrategyNode": propertyPage.get("v.curNode"),
                    "originalNodeName": propertyPage.get("v.originalName")
                });


                //#######ASSERT#######
                expect(component.get("v.curStrat")).toEqual(testStrategyResult);
                expect(propertyPage.get("v.originalName")).toEqual("1337");
                done();

            }).catch(function (e) {
                done.fail(e);
            });
    });
});
