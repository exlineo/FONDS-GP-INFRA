import * as AWS from 'aws-sdk';

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

// Accès à la base de données
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {
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
  const params: { TableName: string, Key: any } = {
    TableName: DB_T_NAME,
    Key: null
  };
  /** Set Key for scan if an ID was received */
  if (requestedItemId) {
    // Set params key to call on object
    params.Key = {
      [PRIMARY_KEY]: requestedItemId
    };
    // Get data from DynamoDB in table
    try {
      const response = await db.get(params).promise();
      if (response.Item) {
        return { statusCode: 200, body: JSON.stringify(response.Item) };
      } else {
        return { statusCode: 404 };
      }
    } catch (er) {
      return { statusCode: 500, body: JSON.stringify(er) };
    }
  } else {
    // Get all data in table
    try {
      const response = await db.scan(params).promise();
      return { statusCode: 200, body: JSON.stringify(response.Items) };
    } catch (er) {
      return { statusCode: 500, body: JSON.stringify(er) };
    }
  }
}