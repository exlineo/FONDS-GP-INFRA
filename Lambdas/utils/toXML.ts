// XML Reference : http://www.openarchives.org/OAI/openarchivesprotocol.html

/**
 * Creating XML header
 * @param setSpec {Array<string>} Adding specifications to header 
 * @param set {Array<string>} If sets are requested
 * @returns Header XML
 */
const header = (setSpec:Array<string>, set?:Array<string>):string => {
    const date = getUTCNow();
    // Generate spec for ListIdentifers, ListRecords and GeRecord requests
    let spec = `
    <setSpec>publication:FGP</setSpec>
    <setSpec>publication:Nemateria</setSpec>
    `;

    if(setSpec.length > 0){
        setSpec.forEach(el => {
           spec += `<setSpec>publication:${el}</setSpec>`;
        });
    }
    if(set && set.length > 0){
        set.forEach(el => spec += `<setName>subject:${el}</setName>`);
    }
    return `
    <header>
        <identifier>oai:nema:2021</identifier>
        <datestamp>${date}</datestamp>
        <setDescription>Serveur OAI Nemateria</setDescription>
        ${spec}
    </header>
    `
};
const about = () => {
    return `
    <about> 
        <provenance
            xmlns="http://www.openarchives.org/OAI/2.0/provenance" 
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
            xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/provenance
            http://www.openarchives.org/OAI/2.0/provenance.xsd">
            <originDescription harvestDate="2002-02-02T14:10:02Z" altered="true">
            <baseURL>http://nemateria.eu</baseURL>
            <identifier>oai:nema:2021</identifier>
            <datestamp>2021-01-01</datestamp>
            <metadataNamespace>http://nemateria.eu</metadataNamespace>
            </originDescription>
        </provenance>
    </about>
    `
}
/** Set prefix XML */
const setPrefixXML = (prefix:string) => {
    return `<${prefix}:${prefix.substring(prefix.indexOf('_'), prefix.length)}`
}
/** Get present time in UTC */
const getUTCNow = () => {
    const now = new Date();
    return now.toISOString();
}
/** */
export const getlistIdentifiersXML = ():string => {
    return '';
}
/** Get identifier for OAI protocol */
export const getIdentifierXML = (setSpec:Array<string> = [], set:Array<string> = []):string => {
    return setIdentifierXML();
}
const setIdentifierXML = ():string => { 
    return `
<?xml version="1.0" encoding="UTF-8"?>
    <OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" 
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/
            http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
    <responseDate>2002-02-08T12:00:01Z</responseDate>
    <request verb="Identify">https://lwif3n2ieb.execute-api.eu-west-3.amazonaws.com/prod/oaipmh</request>
    <Identify>
        <repositoryName>Fonds de dotation Gérard Perrier</repositoryName>
        <baseURL>https://lwif3n2ieb.execute-api.eu-west-3.amazonaws.com/prod/oaipmh</baseURL>
        <protocolVersion>2.0</protocolVersion>
        <adminEmail>admin@archives-en-commun.org</adminEmail>
        <deletedRecord>no</deletedRecord>
        <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
        <compression>deflate</compression>
        <description>
        <oai-identifier 
            xmlns="http://www.openarchives.org/OAI/2.0/oai-identifier"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation=
                "http://www.openarchives.org/OAI/2.0/oai-identifier
            http://www.openarchives.org/OAI/2.0/oai-identifier.xsd">
            <scheme>oai</scheme>
            <repositoryIdentifier>nemateria.eu</repositoryIdentifier>
            <delimiter>:</delimiter>
            <sampleIdentifier>oai:nemateria.eu:nema.record/I0001-sample</sampleIdentifier>
        </oai-identifier>
        </description>
    </Identify>
    </OAI-PMH>
    `
}
/** Get list records */
export const getListRecordsXML = ():string => {
    return '';
}
/** Get a record */
export const getRecordXML = (record:any):string => {
    return '';
}
/**
 * Creating a record in XML
 * @param record 
 * @returns 
 */
const setRecordXML = (record:any):string => {
    let rec = `
    <oai_dc:dc 
    xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" 
    xmlns:dc="http://purl.org/dc/elements/1.1/" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ 
    http://www.openarchives.org/OAI/2.0/oai_dc.xsd">`;

    for(let pref in record){
        if(pref != 'prefix'){
            for(let oai in record[pref]){
                rec  += `
                <${pref}:${oai}>${record[pref][oai]}</${pref}:${oai}>
                `
            }
        }
    }
    rec += `</oai_dc:dc>`;
    return rec;
}
