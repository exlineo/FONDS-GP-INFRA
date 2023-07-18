import * as AWS from 'aws-sdk';
import { getId, bacthGetId, getAll, search } from './requetes/lire';

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

// Accès à la base de données
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {
  
  const body = event.body ? JSON.parse(event.body) : null;

  if(body && typeof body === 'string') {
    return getId(PRIMARY_KEY, body, DB_T_NAME);
  }else if(body && Array.isArray(body)){
    return bacthGetId(PRIMARY_KEY, body, DB_T_NAME);
  }else if(body && !Array.isArray(body)){
    return search(PRIMARY_KEY, body, DB_T_NAME);
  }else{
    return getAll(DB_T_NAME);
  }
}