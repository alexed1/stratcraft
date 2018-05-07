public with sharing class MetadataServiceController {

	public static Integer API_VERSION = 43;

	public static Strategy strategyXMLToObject(String xml) {
		Strategy parsedStrategy = StrategyXmlConverter.convertXmlToStrategy(xml);
		return parsedStrategy;
	}

	@AuraEnabled
	public static String strategyJSONtoXML(String strategyJSON){
		Strategy strategy = strategyJSONConverter.convertJsonToStrategy(strategyJSON);
		try {
			System.debug('Started converting strategy ' + strategy.name + ' to XML');
			String strategyXml = StrategyXmlConverter.convertStrategyToXml(strategy);
			return strategyXml;
		}
		catch(Exception exc) {
			throw new AuraException('Couldn\'t convert strategy JSON object to XML');
		}
	}
	//This is the actual implementation hidden from the client and we assume here that XML is valid because it was sanitized
	//by either 'createOrUpdateStrategyFromXMLRequest' or 'createOrUpdateStrategyRequest'
	private static String createOrUpdateStrategyImpl(String sessionId, String strategyXML) {
		try{
			XPath xp = new XPath(strategyXML);
			String strategyName = xp.find('/RecommendationStrategy/recommendationStrategyName')[0].getText().unescapeXml();
			Zippex archive = new Zippex();
			Blob packageXMLBlob = Blob.valueOf(formXML(strategyName));
			archive.addFile('package.xml', packageXMLBlob, null);
			Blob strategyXMLBlob = Blob.valueOf(strategyXML);

			archive.addFile('recommendationStrategies/' + strategyName + '.recommendationStrategy', strategyXMLBlob, null);
			Blob zipData = archive.getZipArchive();

			String base64EncodedArchive = EncodingUtil.base64Encode(zipData);
			return deployPackage(sessionId, base64EncodedArchive);
		}
		catch(Exception exc) {
			throw new AuraHandledException('MetadataServiceController: ' + exc);
		}
	}

	@AuraEnabled
	public static String createOrUpdateStrategyFromXMLRequest(String sessionId, String strategyXML){
		Strategy strategy = strategyXMLToObject(strategyXML);
		if (strategy.notification.hasErrors()) {
			throw new AuraHandledException('MetadataServiceController: XML is not valid. ' + strategy.notification.errors[0]);
		}
		return createOrUpdateStrategyImpl(sessionId, strategyXML);
	}

	@AuraEnabled
	public static String createOrUpdateStrategyRequest(String sessionId, String strategyJSON){
		String strategyXML = '';
		try {
			strategyXML = strategyJSONtoXML(strategyJSON);
		}
		catch(Exception exc) {
			throw new AuraHandledException('MetadataServiceController: ' + exc);
		}
		return createOrUpdateStrategyImpl(sessionId, strategyXML);
	}

	@AuraEnabled
	public static String deleteStrategyRequest(String sessionId, String strategyName){
		try {
			Zippex archive = new Zippex();
			//package.xml is still needed when you apply destructive changes
			Blob packageXMLBlob = Blob.valueOf(formXML('*'));
			archive.addFile('package.xml', packageXMLBlob, null);
			Blob destructiveChangesXMLBlob = Blob.valueOf(formXML(strategyName));
			archive.addFile('destructiveChanges.xml', destructiveChangesXMLBlob, null);
			Blob zipData = archive.getZipArchive();

			String base64EncodedArchive = EncodingUtil.base64Encode(zipData);
			return deployPackage(sessionId, base64EncodedArchive);
		}
		catch(Exception exc) {
			throw new AuraHandledException('MetadataServiceController: ' + exc);
		}
	}

	@AuraEnabled
	public static String renameStrategyRequest(String sessionId, String strategyJSON, String newStrategyName){
		try {
			String strategyXML = strategyJSONtoXML(strategyJSON);
			XPath xp = new XPath(strategyXML);
			Dom.XmlNode[] nameNode = xp.find('/RecommendationStrategy/recommendationStrategyName');
			String oldStrategyName = nameNode[0].getText().unescapeXml();
			Dom.XmlNode[] children = nameNode[0].getChildren();
			nameNode[0].removeChild(children[0]);
			nameNode[0].addTextNode(newStrategyName.escapeXml());
			String renamedStrategyXML = xp.doc.toXmlString();

			Zippex archive = new Zippex();
			Blob packageXMLBlob = Blob.valueOf(formXML(newStrategyName));
			archive.addFile('package.xml', packageXMLBlob, null);
			Blob destructiveChangesXMLBlob = Blob.valueOf(formXML(oldStrategyName));
			archive.addFile('destructiveChanges.xml', destructiveChangesXMLBlob, null);
			archive.addFile('recommendationStrategies/' + newStrategyName + '.recommendationStrategy', Blob.valueOf(renamedStrategyXML), null);
			Blob zipData = archive.getZipArchive();

			String base64EncodedArchive = EncodingUtil.base64Encode(zipData);
			return deployPackage(sessionId, base64EncodedArchive);
		}
		catch(Exception exc) {
			throw new AuraHandledException('MetadataServiceController: ' + exc);
		}
	}

	@AuraEnabled
	public static String copyStrategyRequest(String sessionId, String strategyJSON, String newStrategyName){
		try {
			String strategyXML = strategyJSONtoXML(strategyJSON);
			XPath xp = new XPath(strategyXML);
			//replace name to a new one
			Dom.XmlNode[] nameNode = xp.find('/RecommendationStrategy/recommendationStrategyName');
			Dom.XmlNode[] children = nameNode[0].getChildren();
			nameNode[0].removeChild(children[0]);
			nameNode[0].addTextNode(newStrategyName.escapeXml());
			String renamedStrategyXML = xp.doc.toXmlString();

			Zippex archive = new Zippex();
			Blob packageXMLBlob = Blob.valueOf(formXML(newStrategyName));
			archive.addFile('package.xml', packageXMLBlob, null);
			archive.addFile('recommendationStrategies/' + newStrategyName + '.recommendationStrategy', Blob.valueOf(renamedStrategyXML), null);
			Blob zipData = archive.getZipArchive();

			String base64EncodedArchive = EncodingUtil.base64Encode(zipData);
			return deployPackage(sessionId, base64EncodedArchive);
		}
		catch(Exception exc) {
			throw new AuraHandledException('MetadataServiceController: ' + exc);
		}
	}

	@AuraEnabled
	public static Strategy checkRetrievalStatusRequest(String sessionId, String id){
		try {
			MetadataService.MetadataPort service = createClient(sessionId);
			MetadataService.RetrieveResult retrieveResult = service.checkRetrieveStatus(id, true);

			if(retrieveResult.done)
			{
				if (retrieveResult.success)
				{
					String strategyXML = finStrategyInZipArchive(retrieveResult.zipFile);
					return strategyXMLToObject(strategyXML);
				}
				else
				{
					throw new AuraHandledException('MetadataServiceController: ' + retrieveResult.errorMessage);
				}
			}
			else
			{
				return null;
			}
		}
		catch (Exception ex) {
			throw new AuraHandledException('MetadataServiceController: ' + ex.getMessage());
		}
	}

	private static String finStrategyInZipArchive(String base64Archive){
		Zippex archive = new Zippex(EncodingUtil.base64Decode(base64Archive));
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

		throw new AuraException('MetadataServiceController: Couldn\'t find strategy in retrieved zip archive');
	}
	//returns deployment job ID
	@AuraEnabled
	public static String getStrategyRequest(String sessionId, String strategyName){
		try{
			if (strategyName == null || strategyName == '')
				throw new AuraHandledException('Strategy name wasn\'t provided');
			return retrievePackage(sessionId, strategyName);
		}
		catch(Exception exc)
		{
			throw new AuraHandledException('MetadataServiceController: ' + exc.getMessage());
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
			MetadataService.FileProperties[] fileProperties = service.listMetadata(queries, API_VERSION);
			List<String> names = new List<String>();
			if (fileProperties!=null) {
				for(MetadataService.FileProperties fileProperty : fileProperties)
				{
					names.add(fileProperty.fullName);
				}

				names.sort();
			}
			return names;
		}
		catch (Exception exc) {
			throw new AuraHandledException('MetadataServiceController: ' + exc.getMessage());
		}
	}

	@AuraEnabled
	public static Strategy checkDeployStatusRequest(String sessionId, String id, Boolean retrieveAffectedStrategy){

		try {
			MetadataService.MetadataPort service = createClient(sessionId);
			MetadataService.DeployResult deployResult = service.checkDeployStatus(id, true);

			if(deployResult.done)
			{
				// Deployment errors?
				if(deployResult.details.componentFailures!=null)
				{
					String errors = '';
					for(MetadataService.DeployMessage deployMessage : deployResult.details.componentFailures)
						if(deployMessage.problem != null)
							errors += deployMessage.problem;

					if (errors!='') {
						//This is done for error message to be retrievable in Apex code
						String errorMessage = 'MetadataServiceController: ' + errors;
						AuraHandledException e = new AuraHandledException(errorMessage);
        				e.setMessage(errorMessage);
						throw e;
					}
				}

				if (retrieveAffectedStrategy != null && retrieveAffectedStrategy) {
					if (deployResult.details.retrieveResult!=null && deployResult.details.retrieveResult.done)
					{
						if (deployResult.details.retrieveResult.zipFile!=null)
						{
							String strategyXML= finStrategyInZipArchive(deployResult.details.retrieveResult.zipFile);
							return strategyXMLToObject(strategyXML);
						}
						else
							throw new AuraHandledException('MetadataServiceController: Deploy was successfull but we couldn\'t retrieve back resulting strategy');
					}
				}
			}
			return null;
		}
		catch (AuraHandledException ex) {
			throw ex;
		}
		catch (Exception ex) {
			String errorMessage = 'MetadataServiceController: ' + ex.getMessage();
			AuraHandledException aex = new AuraHandledException(errorMessage);
			aex.setMessage(errorMessage);
			throw aex;
		}
	}

	private static String formXML(string strategyName){
		return
				'<?xml version="1.0" encoding="UTF-8"?>'+
				'<Package xmlns="http://soap.sforce.com/2006/04/metadata">'+
				'    <types>'+
				'        <members>' + strategyName.escapeXml() + '</members>' +
				'        <name>RecommendationStrategy</name>'+
				'    </types>'+
				'    <version>'+ API_VERSION + '.0</version>'+
				'</Package>';
	}

	private static MetadataService.MetadataPort createClient(String sessionId){
		MetadataService.MetadataPort service = new MetadataService.MetadataPort();
		service.SessionHeader = new MetadataService.SessionHeader_element();
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
		deployOptions.performRetrieve = true;
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
		request.apiVersion = API_VERSION;
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
