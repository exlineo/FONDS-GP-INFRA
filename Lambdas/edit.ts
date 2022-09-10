import { L } from './traductions/fr';
import { createData, updateData, deleteData } from './requetes/edition';

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: any = {}): Promise<any> => {

  let body: any = null;

  const methode = event.requestContext.http.method;
  /** Vérifier que des données ont été envoyées */
  if (!event.body) {
    return { statusCode: 400, body: L.ER_BODY };
  } else {
    // body = JSON.parse(event.body);
    body = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  }
  /** Create, update, delete */
  switch (methode) {
    case 'POST':
      return updateData(body, PRIMARY_KEY, DB_T_NAME);
      break;
    case 'PUT':
      return createData(body, PRIMARY_KEY, DB_T_NAME);
      break;
    case 'DELETE':
      return deleteData(body, PRIMARY_KEY, DB_T_NAME);
      break;
    default:
      return { statusCode: 500, body: L.ER_METHODE }
  }
}