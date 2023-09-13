import { L } from './traductions/fr';
import { createData } from './requetes/edition';

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: any = {}): Promise<any> => {
  /** Vérifier que des données ont été envoyées */
  if (!event || typeof event === "string") {
    return L.ER_BODY;
  }
  /** Create, update, delete */
  return createData(event, PRIMARY_KEY, DB_T_NAME);
}