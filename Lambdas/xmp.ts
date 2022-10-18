import * as AWS from 'aws-sdk';
import { L } from './traductions/fr';

// Exemples de requetes : https://www.hindawi.com/oai-pmh/
// http://www.openarchives.org/OAI/openarchivesprotocol.html#ResponseCompression
// https://libtechlaunchpad.com/2017/02/13/oai-pmh-basics-and-resources/

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const BUCKET = process.env.BUCKET || '';
const NEMA_CONFIG = process.env.NEMA_CONFIG || '';
const db = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({ region: 'eu-west-3' });

export const handler = async (event: any = {}): Promise<any> => {

  const metas = []; // List of final metadata to send
  const regXML = /<[^>]+\srdf\b[^>]*>/g; // Extract raw data from XMP
  const regFiltre = /:(.*?)"\n/g; // Filter data in XMP

  // Get JSON Schema from bucket
  const { Body } = await s3.getObject({ "Bucket": NEMA_CONFIG, "Key": "schemas.json" }).promise();
  const schemas = JSON.parse(Body!.toString());

  // End script if no body was send. Body is used as prefix to scan a specific folder
  if (!event.body || typeof event.body != 'string') {
    return { statusCode: 400, body: L.ER_BODY };
  } else {
    const liste: any = await s3.listObjectsV2({ "Bucket": BUCKET, "Prefix": event.body }).promise(); // Get objects in a directory (prefix) 
    // Get data from objects
    for (let i = 0; i < liste.Contents.length; ++i) {
      const data: Array<string> = [];
      const obj: any = {};
      let exe;
      // Get data from a specific object (selected by Key)
      let { Body } = await s3.getObject({ "Bucket": BUCKET, "Key": liste.Contents[i].Key, "Range": "bytes=0-4096" }).promise();
      let meta = regXML.exec(Body!.toString());

      if (meta) {
        // Extract data from raw file
        while (exe = regFiltre.exec(meta[0])) {
          data.push(exe[1]);
        }
        // List data to extract metadata from the namespaces
        for (let i = 0; i < data.length; ++i) {
          let tmp = data[i].split('="');
          if(schemas.oai_nema.includes(tmp[0]) || schemas.oai_dc.includes(tmp[0])){
            obj[tmp[0]] = tmp[1];
          }
        }
        metas.push(obj);
      }
    };
    console.log(metas);
    return { statusCode: 200, body: metas };
  }
}