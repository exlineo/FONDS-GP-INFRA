import * as AWS from 'aws-sdk';
import { ExifTool, parseJSON } from 'exiftool-vendored';

// import { ExiftoolProcess } from 'node-exiftool';
import { L } from './traductions/fr';
// Exemples de requetes : https://www.hindawi.com/oai-pmh/
// http://www.openarchives.org/OAI/openarchivesprotocol.html#ResponseCompression
// https://libtechlaunchpad.com/2017/02/13/oai-pmh-basics-and-resources/

// Récupérer la variable d'environnement créée par le CDK
const DB_T_NAME = process.env.DB_T_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const BUCKET = process.env.BUCKET || '';
// Accès à la base de données
const db = new AWS.DynamoDB.DocumentClient();
const exif = new ExifTool();
const s3 = new AWS.S3({region:'eu-west-3'});

export const handler = async (event: any = {}): Promise<any> => {

  const s3params = {
    'Bucket':BUCKET,
    'Key': 'Cassel/CAA-I-0001_Cassel_002.jpg'
  }
  let body: any = null;
  
  const { Body } = await s3.getObject(s3params).promise()
  return Body; 
  // const data = await s3.getObject(s3params).promise();
  // return data.Body!.toString('utf-8');
  // s3.getObject(s3params, (er, resp) =>{
  //   if(er){
  //     return { statusCode: 400, body: er};
  //   }else{
  //     return { statusCode: 200, body: resp.Body!.toString('utf-8')};
  //   }
  // });
  // });
  exif.read('./ressources/FFA-I-0009_Bord_de_mer_035.jpg')
  .then(tags => {
    return { statusCode: 200, body: tags};
  })
  .catch(er => {
    return { statusCode: 400, body: er};
  });

}