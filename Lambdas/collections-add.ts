import * as AWS from 'aws-sdk';
import { L } from './traductions/fr';

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
// Accès à la base de données
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async(event:any={}):Promise<any> => {
  
  if (!event.body) {
    return { statusCode: 400, body: L.ER_BODY };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

  // Paramètres transmis dans la requête vers DynamoDB
  const params = {
    TableName: DB_T_NAME,
    Item: item
  };
  // Requête vers DynamoDB
  try {
    const response = await db.put(params).promise();
    return { statusCode: 201, body: L.ADD };
  } catch (er) {
    return { statusCode: 500, body: JSON.stringify(er) };
  }

}