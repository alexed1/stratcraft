public with sharing class MetadataServiceController {


@AuraEnabled
public static String createOrUpdateStrategyRequest(String sessionId, String strategyXML, String strategyName){
	try {
		Zippex archive = new Zippex();
		Blob packageXMLBlob = Blob.valueOf(formXML('*'));
		archive.addFile('package.xml', packageXMLBlob, null);
		Blob strategyXMLBlob = Blob.valueOf(strategyXML);

		archive.addFile('recommendationStrategies/' + strategyName + '.recommendationStrategy', strategyXMLBlob, null);
		Blob zipData = archive.getZipArchive();

		String base64EncodedArchive = EncodingUtil.base64Encode(zipData);
		return deployPackage(sessionId, base64EncodedArchive);
	}
	catch(Exception exc) {
		throw new AuraHandledException('Sorry but we couldn\'t update strategy content. Error: '
		                               + exc);
	}
}

@AuraEnabled
public static String deleteStrategyRequest(String sessionId, String strategyName){
	try {
		Zippex archive = new Zippex();
		Blob packageXMLBlob = Blob.valueOf(formXML('*'));
		//package.xml is still needed when you apply destructive changes
		archive.addFile('package.xml', packageXMLBlob, null);
		Blob destructiveChangesXMLBlob = Blob.valueOf(formXML(strategyName));
		archive.addFile('destructiveChanges.xml', destructiveChangesXMLBlob, null);
		Blob zipData = archive.getZipArchive();

		String base64EncodedArchive = EncodingUtil.base64Encode(zipData);
		return deployPackage(sessionId, base64EncodedArchive);
	}
	catch(Exception exc) {
		throw new AuraHandledException('Sorry but we couldn\'t update strategy content. Error: '
		                               + exc);
	}
}

@AuraEnabled
public static String renameStrategyRequest(String sessionId, String strategyXML, String oldStrategyName, String newStrategyName){
	try {
		Zippex archive = new Zippex();
		Blob packageXMLBlob = Blob.valueOf(formXML(newStrategyName));
		archive.addFile('package.xml', packageXMLBlob, null);
		Blob destructiveChangesXMLBlob = Blob.valueOf(formXML(oldStrategyName));
		archive.addFile('destructiveChanges.xml', destructiveChangesXMLBlob, null);
		archive.addFile('recommendationStrategies/' + newStrategyName + '.recommendationStrategy', Blob.valueOf(strategyXML), null);
		Blob zipData = archive.getZipArchive();

		String base64EncodedArchive = EncodingUtil.base64Encode(zipData);
		return deployPackage(sessionId, base64EncodedArchive);
	}
	catch(Exception exc) {
		throw new AuraHandledException('Sorry but we couldn\'t rename strategy. Error: '
		                               + exc);
	}
}

@AuraEnabled
public static String copyStrategyRequest(String sessionId, String strategyXML, String newStrategyName){
	try {

		Zippex archive = new Zippex();
		Blob packageXMLBlob = Blob.valueOf(formXML(newStrategyName));
		archive.addFile('package.xml', packageXMLBlob, null);
		archive.addFile('recommendationStrategies/' + newStrategyName + '.recommendationStrategy', Blob.valueOf(strategyXML), null);
		Blob zipData = archive.getZipArchive();

		String base64EncodedArchive = EncodingUtil.base64Encode(zipData);
		return deployPackage(sessionId, base64EncodedArchive);
	}
	catch(Exception exc) {
		throw new AuraHandledException('Sorry but we couldn\'t copy strategy. Error: '
		                               + exc);
	}
}

@AuraEnabled
public static String checkRetrievalStatusRequest(String sessionId, String id){
	try {
		MetadataService.MetadataPort service = createClient(sessionId);
		MetadataService.RetrieveResult retrieveResult = service.checkRetrieveStatus(id, true);

		if(retrieveResult.done)
		{
			if (retrieveResult.success)
			{
				Zippex archive = new Zippex(EncodingUtil.base64Decode(retrieveResult.zipFile));
				Set <String> fileNames = archive.getFileNames();

				for (String fileName : fileNames)
				{
					if (fileName.startsWith('recommendationStrategies'))
					{
						Blob file = archive.getFile(fileName);
						String xml = file.toString();
						return xml;
					}
				}
				return ''; //it shouldn't be called really
			}
			else
			{
				throw new AuraHandledException('Sorry but we couldn\'t load strategy content. Error: '
				                               + retrieveResult.errorMessage);
			}
		}
		else
		{
			return 'deploying';
		}
	}
	catch (Exception ex) {
		throw new AuraHandledException('Sorry but we couldn\'t load strategy content. Error: '+ex.getMessage());
	}
}


@AuraEnabled
public static String getStrategyRequest(String sessionId, String strategyName){
	try{
		if (strategyName == null || strategyName == '')
			throw new AuraHandledException('Strategy name wasn\'t provided');
		return retrievePackage(sessionId, strategyName);
	}
	catch(Exception exc)
	{
		throw new AuraHandledException('Sorry but we couldn\'t load strategy content. Error: '
		                               + exc.getMessage());
	}
}

@AuraEnabled
public static List<String> loadStrategyNamesRequest(String sessionId){
	try{
		MetadataService.MetadataPort service = createClient(sessionId);

		List<MetadataService.ListMetadataQuery> queries = new List<MetadataService.ListMetadataQuery>();
		MetadataService.ListMetadataQuery queryWorkflow = new MetadataService.ListMetadataQuery();
		queryWorkflow.type_x = 'RecommendationStrategy';
		queries.add(queryWorkflow);
		MetadataService.FileProperties[] fileProperties = service.listMetadata(queries, 42);
		List<String> names = new List<String>();
		for(MetadataService.FileProperties fileProperty : fileProperties)
		{
			names.add(fileProperty.fullName);
		}

		return names;
	}
	catch (Exception exc) {
		throw new AuraHandledException('Sorry but we couldn\'t load strategy names. Error: '
		                               + exc.getMessage());
	}
}


@AuraEnabled
//empty response means it is all good
public static String checkDeployStatusRequest(String sessionId, String id){

	String response = '';
	try {
		MetadataService.MetadataPort service = createClient(sessionId);
		MetadataService.DeployResult deployResult = service.checkDeployStatus(id, true);

		if(deployResult.done)
		{
			// Deployment errors?
			if(deployResult.details!=null && deployResult.details.componentFailures!=null)
			{
				for(MetadataService.DeployMessage deployMessage : deployResult.details.componentFailures)
					if(deployMessage.problem!=null)
						response += deployMessage.problem;
				if (response!='')
					throw new AuraHandledException('Sorry but we couldn\'t check deploy status. Error: ' + response);
			}
		}
		else
			response = 'deploying';
	}
	catch (Exception ex) {
		throw new AuraHandledException('Sorry but we couldn\'t check deploy status. Error: ' + ex);
	}

	return response;
}




private static String formXML(string strategyName){
	return
	        '<?xml version="1.0" encoding="UTF-8"?>'+
	        '<Package xmlns="http://soap.sforce.com/2006/04/metadata">'+
	        '    <types>'+
	        '        <members>' + strategyName + '</members>'+
	        '        <name>RecommendationStrategy</name>'+
	        '    </types>'+
	        '    <version>42.0</version>'+
	        '</Package>';
}


private static MetadataService.MetadataPort createClient(String sessionId){

	// fix for refresh token from this article https://www.gscloudsolutions.com/blogpost/Using-Named-Credentials-with-the-Apex-Wrapper-Salesforce-Metadata-API-apex-mdapi?blogpost=true&utm_source=twitter&utm_medium=social&utm_campaign=named_credentials
	// needed only if we user named credentials
	// String restUrl = 'callout:StratcraftMDAPI/services/data/v42.0/limits';
	// Http h = new Http();
	// HttpRequest req = new HttpRequest();
	// req.setEndpoint(restUrl);
	// req.setMethod('GET');
	// HttpResponse res = h.send(req);

	MetadataService.MetadataPort service = new MetadataService.MetadataPort();
	service.SessionHeader = new MetadataService.SessionHeader_element();
	//service.SessionHeader.sessionId = '{!$Credential.OAuthToken}'; <---- Named credentials stuff
	service.SessionHeader.sessionId = sessionId;
	return service;
}

private static String deployPackage(String sessionId, String base64EncodedArchive){
	MetadataService.MetadataPort service = createClient(sessionId);
	MetadataService.DeployOptions deployOptions = new MetadataService.DeployOptions();
	deployOptions.allowMissingFiles = false;
	deployOptions.autoUpdatePackage = false;
	deployOptions.checkOnly = false;
	deployOptions.ignoreWarnings = false;
	deployOptions.performRetrieve = false;
	deployOptions.purgeOnDelete = false;
	deployOptions.rollbackOnError = false;
	deployOptions.singlePackage = true;
	deployOptions.testLevel = 'NoTestRun';
	MetadataService.AsyncResult AsyncResult = service.deploy(base64EncodedArchive, DeployOptions);
	return AsyncResult.Id;
}

private static String retrievePackage(String sessionId, String strategyName){
	MetadataService.MetadataPort service = createClient(sessionId);
	MetadataService.RetrieveRequest request = new MetadataService.RetrieveRequest();
	request.apiVersion = 42;
	request.singlePackage = true;

	MetadataService.Package_x manifest = new MetadataService.Package_x();
	manifest.types = new List<MetadataService.PackageTypeMembers>();
	manifest.types.Add(new MetadataService.PackageTypeMembers());
	manifest.types[0].name='RecommendationStrategy';
	manifest.types[0].members = new List<String>();
	manifest.types[0].members.add(strategyName);
	request.unpackaged = manifest;

	return service.retrieve(request).id;
}

}


