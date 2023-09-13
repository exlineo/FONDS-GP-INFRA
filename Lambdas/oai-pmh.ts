import * as AWS from 'aws-sdk';
import { getRecordXML, getIdentifierXML, getlistIdentifiersXML, getListRecordsXML } from './utils/toXML';
import { getRecByPrefix } from './requetes/oai';
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

  let body: any = null;
  let queries: any = event['queryStringParameters'];

  const verb = queries['verb'] || null; // Get verb parameter from OAI norm
  const identifier = queries['identifier'] || null; // Get identifier
  const metadataprefix = queries['metadataprefix'] || null; // Get prefix if available;
  const set = queries['set']; // Get Set

  /** Get query params from URL */
  console.log(verb, metadataprefix);
  /** List records from a prefix */
  const getListRecords = (): string => {
    return getListRecordsXML();
  };
  const getlistSets = () => {

  };
  const getListMetadataFormats = () => {

  };
  /** Get a record in the database */
  const getRecord = (): unknown => {
    try {
      const rec = getRecByPrefix(PRIMARY_KEY, identifier, DB_T_NAME, metadataprefix ?? metadataprefix);
      return getRecordXML(rec);
    } catch (er) {
      return er;
    }
  }
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
        resp = getRecord();
        break;
      case 'listrecords':
        resp = getListRecords();
        break;
      default:
        resp = getIdentifier();
    }
  }

  return { statusCode: 500, body: JSON.stringify(resp) };


  // Requête vers DynamoDB
  // try {
  //   const response = await db.update(params).promise();
  //   return { statusCode: 204, body: L.UPDATE };
  // } catch (er: any) {
  //   // const errorResponse = er.code === 'ValidationException' && er.message.includes('reserved keyword') ?
  //   // DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
  //   return { statusCode: 500, body: JSON.stringify(er) };
  // }

}