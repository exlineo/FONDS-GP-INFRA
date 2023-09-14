import * as AWS from 'aws-sdk';
import { setRecordXML, getIdentifierXML, getlistIdentifiersXML, setListRecordsXML } from './utils/toXML';
import { getIdPrefix } from './requetes/oai';
import { L } from './traductions/fr';
// Exemples de requetes : https://www.hindawi.com/oai-pmh/
// http://www.openarchives.org/OAI/openarchivesprotocol.html#ResponseCompression
// http://www.openarchives.org/OAI/openarchivesprotocol.html
// https://libtechlaunchpad.com/2017/02/13/oai-pmh-basics-and-resources/

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
// Accès à la base de données
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}, context: any): Promise<any> => {

  console.log("Context", context);
  
  let queries: any = event['queryStringParameters'];

  const verb = queries['verb'] || null; // Get verb parameter from OAI norm
  const identifier = queries['identifier'] || null; // Get identifier
  const metadataprefix = queries['metadataprefix'] || null; // Get prefix if available;
  const set = queries['set']; // Get Set

  /** Get query params from URL */
  console.log(verb, metadataprefix);
  /** List records from a prefix */
  const getListRecords = async () => {
    return await setListRecordsXML();
  };
  const getlistSets = async () => {

  };
  const getListMetadataFormats = async () => {

  };
  /** Get a record in the database */
  const getRecord = async (): Promise<any> => {
    try {
      const rec = await getIdPrefix(PRIMARY_KEY, identifier, DB_T_NAME, metadataprefix ?? metadataprefix);
      return setRecordXML(PRIMARY_KEY, rec, {identifier, verb, metadataprefix});
    } catch (er) {
      return er;
    }
  }
  /** Get informations from the OIA-PMH server */
  const getIdentifier = async () => {
    return await getIdentifierXML();
  }
  const getlistIdentifiers = async () => {
    return await getlistIdentifiersXML();
  }
  /** Response to send */
  let resp: unknown = '';
  /** Filter request from verb parameter  */
  if (verb) {
    switch (verb.toLowerCase()) {
      case 'identifier':
        resp = await getIdentifierXML();
        break;
      case 'listidentifier':
        resp = await getlistIdentifiersXML();
        break;
      case 'getrecord':
        resp = await getRecord();
        break;
      case 'listrecords':
        resp = await getListRecords();
        break;
      default:
        resp = await getIdentifier();
    }
  }

  return { statusCode: 200, body: JSON.stringify(resp) };
}