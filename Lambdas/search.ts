import * as AWS from 'aws-sdk';
import { search } from './requetes/lire';

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
let results: Array<any> = [];
let notices: any = [];

// Accès à la base de données
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {
  // Waiting body as {collection:string, libre:Array<string>}
  const body = event.body ? JSON.parse(event.body) : null;
  if (notices.length == 0) {
    notices = await search(DB_T_NAME);
  }
  if (body) {
    results = notices.filter((n:any) => {
      const m = JSON.stringify(n);
      if(body.collection && body.collection.length > 0){
        if(n.nema.collection_name == body.collection){
          for (let o = 0; o < body.libre.length; ++o) {
            if (m.indexOf(body.libre[o]) != -1){
              return n;
            }
          }
        }
      }else{
        for (let o = 0; o < body.libre.length; ++o) {
            if (m.indexOf(body.libre[o]) != -1){
              return n;
            }
          }
      }
    });
  }
  return results;
}