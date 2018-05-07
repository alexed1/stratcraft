@isTest
public with sharing class MetadataServiceControllerTests {
    
    class LoadStrategyNamesWebServiceMock implements WebServiceMock {
        public void doInvoke(
                Object stub,
                Object request,
                Map<String, Object> response,
                String endpoint,
                String soapAction,
                String requestName,
                String responseNS,
                String responseName,
                String responseType) {
                MetadataService.FileProperties[] fileProperties = new List<MetadataService.FileProperties>();
                fileProperties.add(new MetadataService.FileProperties('Abc2'));
                fileProperties.add(new MetadataService.FileProperties('Abc1'));
                MetadataService.listMetadataResponse_element result = new MetadataService.listMetadataResponse_element();
                result.result = fileProperties;
                response.put('response_x', result);
        }
    }

    @isTest
    public static void loadStrategyNamesRequest_Always_ReturnsListOfNames() {
        Test.setMock(WebServiceMock.class, new LoadStrategyNamesWebServiceMock());
        List<string> strategyNames = MetadataServiceController.loadStrategyNamesRequest('id');
        System.assertEquals('Abc1', strategyNames[0]);
        System.assertEquals('Abc2', strategyNames[1]);
    }

    class RetrieveResponseWebServiceMock implements WebServiceMock {
        public void doInvoke(
                Object stub,
                Object request,
                Map<String, Object> response,
                String endpoint,
                String soapAction,
                String requestName,
                String responseNS,
                String responseName,
                String responseType) {
                MetadataService.retrieveResponse_element result = new MetadataService.retrieveResponse_element();
                result.result = new MetadataService.AsyncResult();
                result.result.id = '123';
                response.put('response_x', result);
        }
    }

    @isTest
    public static void getStrategyRequest_Always_ReturnsRequestId() {
        Test.setMock(WebServiceMock.class, new RetrieveResponseWebServiceMock());
        String requestId = MetadataServiceController.getStrategyRequest('sessionId', 'Strategy Name');
        System.assertEquals('123', requestId);
    }

    class DeployResponseWebServiceMock implements WebServiceMock {
        public void doInvoke(
                Object stub,
                Object request,
                Map<String, Object> response,
                String endpoint,
                String soapAction,
                String requestName,
                String responseNS,
                String responseName,
                String responseType) {
                MetadataService.deployResponse_element result = new MetadataService.deployResponse_element();
                result.result = new MetadataService.AsyncResult();
                result.result.id = '123';
                response.put('response_x', result);
        }
    }

    @isTest
    public static void createOrUpdateStrategyRequest_Always_ReturnsRequestId() {
        Test.setMock(WebServiceMock.class, new DeployResponseWebServiceMock());
        String requestId = MetadataServiceController.createOrUpdateStrategyRequest('sessionId', FixturesJson.UnionNodeStrategyJson);
        System.assertEquals('123', requestId);
    }

    @isTest
    public static void deleteStrategyRequest_Always_ReturnsRequestId() {
        Test.setMock(WebServiceMock.class, new DeployResponseWebServiceMock());
        String requestId = MetadataServiceController.deleteStrategyRequest('sessionId', 'Strategy');
        System.assertEquals('123', requestId);
    }

    @isTest
    public static void renameStrategyRequest_Always_ReturnsRequestId() {
        Test.setMock(WebServiceMock.class, new DeployResponseWebServiceMock());
        String requestId = MetadataServiceController.renameStrategyRequest('sessionId', FixturesJson.UnionNodeStrategyJson, 'NewStrategy');
        System.assertEquals('123', requestId);
    }

    @isTest
    public static void copyStrategyRequest_Always_ReturnsRequestId() {
        Test.setMock(WebServiceMock.class, new DeployResponseWebServiceMock());
        String requestId = MetadataServiceController.copyStrategyRequest('sessionId', FixturesJson.UnionNodeStrategyJson, 'NewStrategy');
        System.assertEquals('123', requestId);
    }

    class CheckRetrieveStatusResponseWebServiceMock implements WebServiceMock {
        public void doInvoke(
                Object stub,
                Object request,
                Map<String, Object> response,
                String endpoint,
                String soapAction,
                String requestName,
                String responseNS,
                String responseName,
                String responseType) {
                MetadataService.checkRetrieveStatusResponse_element result = new MetadataService.checkRetrieveStatusResponse_element();
                result.result = new MetadataService.RetrieveResult();
                result.result.done = true;
                result.result.success = true;
                result.result.zipFile = Fixtures.Base64StrategyZip;
                response.put('response_x', result);
        }
    }

    @isTest
    public static void checkRetrievalStatusRequest_WhenRequestIsSuccessful_ReturnsStrategy() {
        Test.setMock(WebServiceMock.class, new CheckRetrieveStatusResponseWebServiceMock());
        Strategy strategy = MetadataServiceController.checkRetrievalStatusRequest('123', '123');
        System.assertEquals('UniqueName1', strategy.masterLabel);
    }

    class CheckDeployStatusResponseSuccessWebServiceMock implements WebServiceMock {
        public void doInvoke(
                Object stub,
                Object request,
                Map<String, Object> response,
                String endpoint,
                String soapAction,
                String requestName,
                String responseNS,
                String responseName,
                String responseType) {
                MetadataService.checkDeployStatusResponse_element result = new MetadataService.checkDeployStatusResponse_element();
                result.result = new MetadataService.DeployResult();
                result.result.done = true;
                result.result.details = new MetadataService.DeployDetails();
                result.result.details.retrieveResult = new MetadataService.RetrieveResult();
                result.result.details.retrieveResult.done = true;
                result.result.details.retrieveResult.success = true;
                result.result.details.retrieveResult.zipFile = Fixtures.Base64StrategyZip;
                //For test coverage purposes
                result.result.details.runTestResult = new MetadataService.RunTestsResult();
                MetadataService.CodeCoverageResult codeCoverageResult = new MetadataService.CodeCoverageResult();
                codeCoverageResult.locationsNotCovered = new List<MetadataService.CodeLocation>();
                codeCoverageResult.locationsNotCovered.add(new MetadataService.CodeLocation());
                result.result.details.runTestResult.codeCoverage = new List<MetadataService.CodeCoverageResult>();
                result.result.details.runTestResult.codeCoverage.add(codeCoverageResult);
                result.result.details.runTestResult.codeCoverageWarnings = new List<MetadataService.CodeCoverageWarning>();
                result.result.details.runTestResult.codeCoverageWarnings.add(new MetadataService.CodeCoverageWarning());
                result.result.details.runTestResult.successes = new List<MetadataService.RunTestSuccess>();
                result.result.details.runTestResult.successes.add(new MetadataService.RunTestSuccess());
                result.result.details.runTestResult.failures = new List<MetadataService.RunTestFailure>();
                result.result.details.runTestResult.failures.add(new MetadataService.RunTestFailure());
                response.put('response_x', result);
        }
    }

    @isTest
    public static void checkDeployStatusRequest_WhenRequestIsSuccessful_ReturnsStrategy() {
        Test.setMock(WebServiceMock.class, new CheckDeployStatusResponseSuccessWebServiceMock());
        Strategy strategy = MetadataServiceController.checkDeployStatusRequest('123', '123', true);
        System.assertEquals('UniqueName1', strategy.masterLabel);
    }

    class CheckDeployStatusResponseFailureWebServiceMock implements WebServiceMock {
        public void doInvoke(
                Object stub,
                Object request,
                Map<String, Object> response,
                String endpoint,
                String soapAction,
                String requestName,
                String responseNS,
                String responseName,
                String responseType) {
                MetadataService.checkDeployStatusResponse_element result = new MetadataService.checkDeployStatusResponse_element();
                result.result = new MetadataService.DeployResult();
                result.result.done = true;
                result.result.details = new MetadataService.DeployDetails();
                result.result.details.componentFailures = new List<MetadataService.DeployMessage>();
                MetadataService.DeployMessage message = new MetadataService.DeployMessage();
                result.result.details.componentFailures.add(message);
                message.problem = 'Bad error';
                response.put('response_x', result);
        }
    } 
    
    @isTest
    public static void checkDeployStatusRequest_WhenRequestFails_ThrowsException() {
        Test.setMock(WebServiceMock.class, new CheckDeployStatusResponseFailureWebServiceMock());
        String errorMessage = '';
        try {
            Strategy strategy = MetadataServiceController.checkDeployStatusRequest('123', '123', true);
        }
        catch (AuraHandledException ex) {
            errorMessage = ex.getMessage();
        }
        System.assertEquals('MetadataServiceController: Bad error', errorMessage);
    }
}