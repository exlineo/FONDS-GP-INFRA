import * as AWS from 'aws-sdk';;
import { L } from './traductions/fr';
// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
// Accès à la base de données
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async(event:any={}):Promise<any> => {
  // Get data from request (if there'is)
  let requestedItemId;
  const body = event.body ? JSON.parse(event.body) : {};
  if(body.id) {
    requestedItemId = body.id;
  }else if(event.queryStringParameters && event.queryStringParameters.id){
    requestedItemId = event.queryStringParameters.id;
  }else{
    requestedItemId = null;
  };
  // Paramètres transmis dans la requête vers DynamoDB
  const params = {
    TableName: DB_T_NAME,
    Key: {
      [PRIMARY_KEY]: requestedItemId
    }
  };
  // Requête vers DynamoDB
  try {
    const response = await db.delete(params).promise();
    return { statusCode: 200, body: L.DEL };
  } catch (er) {
    return { statusCode: 500, body: JSON.stringify(er) };
  }

}