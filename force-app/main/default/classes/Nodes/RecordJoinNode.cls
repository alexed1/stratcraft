public with sharing class RecordJoinNode extends BaseNode {

/*
	<xsd:complexType name="StrategyNodeRecordJoin">
	<xsd:complexContent>
		<xsd:extension base="tns:StrategyNodeUnionBase">
			<xsd:sequence>
				<xsd:element name="field" type="xsd:string"/>
				<xsd:element name="fieldNameRemapping" minOccurs="0" maxOccurs="unbounded" type="tns:StrategyNodeSoqlFieldRemapping"/>
				<xsd:element name="filterColumn" minOccurs="0" type="xsd:string"/>
				<xsd:element name="filterValue" minOccurs="0" type="xsd:string"/>
				<xsd:element name="joinColumn" type="xsd:string"/>
				<xsd:element name="object" type="xsd:string"/>
			</xsd:sequence>
		</xsd:extension>
	</xsd:complexContent>
	</xsd:complexType>

	given proposition objects, with their id numbers, join to data from OBJECT, bringing over FIELD 'prediction'
	take the data where propositionId matches the JOINCOLUMN in the OBJECT (usually 'propositionId ' too) and 
	filter so that you only take the predictions where FILTERCOLUMN equals FILTERVALUE ('contactId = $RecordId')
	
*/
    @AuraEnabled public String field { get; set; }
	@AuraEnabled public String filterColumn { get; set; }
	@AuraEnabled public String filterValue { get; set; }
	@AuraEnabled public String joinColumn { get; set; }
	@AuraEnabled public String incomingObject { get; set; }

	

    public RecordJoinNode() {
        nodeType = NodeTypes.RECORD_JOIN;
        
    }
}