import * as AWS from 'aws-sdk';
import { L } from './traductions/fr';

// Exemples de requetes : https://www.hindawi.com/oai-pmh/
// http://www.openarchives.org/OAI/openarchivesprotocol.html#ResponseCompression
// https://libtechlaunchpad.com/2017/02/13/oai-pmh-basics-and-resources/

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const BUCKET = process.env.BUCKET || '';
const db = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({ region: 'eu-west-3' });

export const handler = async (event: any = {}): Promise<any> => {

  const metas = []; // List of final metadata to send
  const regXML = /<[^>]+\srdf\b[^>]*>/g; // Extract raw data from XMP
  const regFiltre = /:(.*?)"(\n|>)/g; // Filter data in XMP
  const schemas:Array<string> = []; // List of all data to get in medias
  const prefix:any = {}; // Object to store prefix and there schemas

  /** Get schema from a file in a bucket (deprecated) */
  const params = {
    TableName: DB_T_NAME,
    Key: { [PRIMARY_KEY]: "schemas" }
  };
  /** Get metadata list in schemas from database */
  const response = await db.get(params).promise();
  if (response.Item) {
    for (let i in response.Item) {
        if(response.Item[i].schema) {
          // response.Item[i].schema.values.forEach((v:any) => schemas.push(v));
          prefix[i] = response.Item[i];
        };
      }
  } else {
      return { statusCode: 404, body: L.ER_DATA };
  }
  
  /** End script if no body was send. Body is used as prefix to scan a specific folder */
  const liste = await s3.listObjectsV2({ "Bucket": BUCKET, "Prefix": event.body }).promise();
  if (!event.body) {
    const dir: Array<string> = [];
    for (let i = 0; i < liste.Contents!.length; ++i) {
      const fold = liste.Contents![i].Key!.split('/')[0];
      if (!dir.includes(fold)) dir.push(fold);
    }
    return { statusCode: 200, body: dir };
  } else {
    // Get data from objects
    for (let i = 0; i < liste.Contents!.length; ++i) {
      const data: Array<string> = [];
      const obj: any = {};
      let exe;
      // Get data from a specific object (selected by Key)
      // let { Body } = await s3.getObject({ "Bucket": BUCKET, "Key": liste.Contents![i].Key!, "Range": "bytes=0-4096" }).promise();
      let { Body } = await s3.getObject({ "Bucket": BUCKET, "Key": liste.Contents![i].Key! }).promise();
      let meta = regXML.exec(Body!.toString());
      regXML.lastIndex = 0; // Réinitialisation de l'index du regex pour pour scanner tous les objet (ne scan qu'un sur deux sinon)
      if (meta) {
        // Extract data from raw file
        while (exe = regFiltre.exec(meta[0])) {
          data.push(exe[1]);
        }
        // List data to extract metadata from the namespaces
        for (let j = 0; j < data.length; ++j) {
          let tmp = data[j].split('="');
          for(let j in prefix){
            if(!obj[j]) obj[j] = {};
            if (prefix[j].schema.values.includes(tmp[0])) {
              obj[j][tmp[0]] = tmp[1];
            }
          }
        }
        metas.push(obj);
      }
    };
    console.log(metas);
    return { statusCode: 200, body: metas };
  }
}