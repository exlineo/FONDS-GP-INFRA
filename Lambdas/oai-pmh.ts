import * as AWS from 'aws-sdk';
import { setRecordXML, getIdentifierXML, getlistIdentifiersXML, setListRecordsXML, setListSetsXML } from './utils/toXML';
import { getIdPrefix, getListofSets } from './requetes/oai';
import { L } from './traductions/fr';
// Exemples de requetes : https://www.hindawi.com/oai-pmh/
// http://www.openarchives.org/OAI/openarchivesprotocol.html#ResponseCompression
// http://www.openarchives.org/OAI/openarchivesprotocol.html
// https://libtechlaunchpad.com/2017/02/13/oai-pmh-basics-and-resources/

// Récupérer la variable d'environnement créée par le CDK
// const DB_T_NAME = process.env.DB_T_NAME || '';
// const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const DB:Array<{KEY:string, TABLE:string}> = []; // In case of multiple tables sent in env

// Accès à la base de données
const db = new AWS.DynamoDB.DocumentClient();


export const handler = async (event: any = {}, context: any): Promise<any> => {

  console.log("Context", context);

  let queries: any = event['queryStringParameters'];

  let verb:any = null;
  let identifier:any = null; // Get identifier
  let metadataprefix:any = null; // Get prefix if available;
  let set:any = null; // Get Set
  setKeysTables(); // Populate DB with keys and tables

  /** FIlter queries to avoid errors on requests */
  for(let r in queries){
    switch(r){
      case 'verb':
        verb = queries['verb']; // Get verb parameter from OAI norm
        break;
      case 'identifier':
        identifier = queries['identifier']; // Get identifier parameter from OAI norm
        break;
      case 'metadataprefix':
        metadataprefix = queries['metadataprefix']; // Get prefix parameter from OAI norm
        break;
      case 'set':
        set = queries['set']; // Get set parameter from OAI norm
        break;
      default:
        return error('badArgument');
    }
  }

  /** Get query params from URL */
  console.log(verb, metadataprefix);
  /** List records from a prefix */
  const getListRecords = () => {
    return setListRecordsXML();
  };
  /** Get informations from the OIA-PMH server */
  const getIdentifier = () => {
    return getIdentifierXML();
  }
  const getlistIdentifiers = () => {
    return getlistIdentifiersXML();
  }
  /** Response to send */
  let resp: unknown = '';
  /** Filter request from verb parameter  */
  if (verb) {
    switch (verb.toLowerCase()) {
      case 'identifier':
        resp = getIdentifierXML();
        break;
      case 'listidentifier':
        resp = getlistIdentifiersXML();
        break;
      case 'getrecord':
        // resp = getRecord();
        resp = getIdPrefix(DB[0].KEY, identifier, DB[0].TABLE, metadataprefix ?? metadataprefix);
        break;
      case 'listrecords':
        resp = getListRecords();
        break;
      case 'listsets':
        resp = getListofSets(DB[1].KEY, DB[1].TABLE);
        break;
      default:
        resp = getIdentifier();
    }
  }

  return { statusCode: 200, body: JSON.stringify(resp) };
}
/**
 * Implémenter les erreurs normées OAI-PMH
 * @param er Information sur l'erreur à traiter
 * @returns Une erreur HTTP
 */
const error = (er: string) => {
  switch (er) {
    case 'badArgument ':
      return { statusCode: 400, body: L.ERROR_BADARGUMENT };
    case 'idDoesNotExist':
      return { statusCode: 400, body: L.ERROR_IDDOESNOTEXIST };
    case 'noMetadataFormats':
      return { statusCode: 400, body: L.ERROR_NOMETADATAFORMAT };
    case 'cannotDisseminateFormat':
      return { statusCode: 400, body: L.ERROR_NODISSEMINATEFORMAT };
    case 'noRecordsMatch':
      return { statusCode: 404, body: L.ERROR_NORECORD };
    case 'badResumptionToken':
      return { statusCode: 400, body: L.ERROR_BADRESUMPTIONTOKEN };
    case 'noSetHierarchy':
      return { statusCode: 400, body: L.ERROR_NOSETHIERARCHY };
    case 'badVerb':
      return { statusCode: 400, body: L.ERROR_BADVERB };
    default:
      return { statusCode: 400, body: L.ERROR_ANONYMOUS };
    }
}
/** Get tables and keys list */
const setKeysTables = () => {
  if(process.env.DB_T_NAME!.indexOf(',') > 0){
    const keys = process.env.DB_T_NAME!.split(',');
    keys.forEach((k, i) => {
      DB.push({KEY: k.substring(3, k.length), TABLE: k});
    })
  }else{
    DB.push({KEY: process.env.PRIMARY_KEY!, TABLE: process.env.DB_T_NAME!});
  }
}