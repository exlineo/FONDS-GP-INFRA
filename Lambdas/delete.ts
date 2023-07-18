import { L } from './traductions/fr';
import { deleteData, isObject } from './requetes/edition';

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: any = {}): Promise<any> => {

  let body: any = null;
  /** Vérifier que des données ont été envoyées */
  if (!isObject(event)) {
    // return { statusCode: 400, body: { message : L.ER_BODY } };
    return L.ER_BODY
  } else {
    // body = JSON.parse(event.body);
    body = typeof event == 'object' ? event : JSON.parse(event);
  }
  /** Create, update, delete */
  return deleteData(body, PRIMARY_KEY, DB_T_NAME);
}