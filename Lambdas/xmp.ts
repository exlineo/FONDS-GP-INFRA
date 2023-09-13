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

  const metas:Array<any> = [];
  const regXML = /<[^>]+\srdf\b[^>]*>/g; // Extraire les attributs de la balise rdf:Description
  const regFiltre = /:(.*?)"(\n|>)/g; // Récupérer les meta dans la balise rdf:Description
  const regTags = /<rdf:Description.*?>(.*?)<\/rdf:Description>/gms; // Extraire les balises incluses dans rdf:Description
  const regLi = /<rdf:li.*?>(.*?)<\/rdf:li>/gms; // Récupérer les tableaux de données dans les balises
  const prefix:any = {}; // Liste des prefix (namespaces) identifiés dans la base de données
  const data:Array<any> = []; // Données en cours de traitement

  /** Get schema from a file in a bucket (deprecated) */
  const params = {
    TableName: DB_T_NAME,
    Key: { [PRIMARY_KEY]: "schemas" }
  };
  // Get body or not
  const body = event.body ? event.body : '';
  /** End script if no body was send. Body is used as prefix to scan a specific folder */
  const liste:any = await s3.listObjectsV2({ "Bucket": BUCKET, "Prefix": body }).promise();
  if (!event.body) {
    const dir: Array<string> = [];
    for (let i = 0; i < liste.Contents!.length; ++i) {
      const fold = liste.Contents![i].Key!.split('/')[0];
      if (!dir.includes(fold)) dir.push(fold);
    }
    return dir;
  } else {
    /** Get metadata list in schemas from database */
    const response = await db.get(params).promise();
    if (response.Item) {
      for (let i in response.Item) {
          if(response.Item[i].schema) {
            prefix[i] = response.Item[i];
          };
        }
    } else {
        return L.ER_DATA
    }
    // Get data from objects
    for (let i = 0; i < liste.Contents!.length; ++i) {
      let { Body } = await s3.getObject({ "Bucket": BUCKET, "Key": liste.Contents[i].Key }).promise();
      let exe;
      const obj:any = {};
      let meta = regXML.exec(Body!.toString());
        if (meta) {
          while ((exe = regFiltre.exec(meta[0]))) {
            data.push(exe[1]);
          }
          
          // Récupérer les variables dans les attributs de la balise rdf:Description
          for (let j = 0; j < data.length; ++j) {
            let tmp = data[j].split('="');
            for (let p in prefix) {
              if (!obj[p])
                obj[p] = {};
              if (prefix[p].schema.values.includes(tmp[0])) {
                obj[p][tmp[0]] = tmp[1];
              }
            };
          }
        }
      
      let tags = Body!.toString().match(regTags);
      console.log("Tags : " + Body!.toString().match(regTags));
      
      if(tags){
        let tt;
        // Traitement des balise rdf:li
        for (let p in prefix) {
          const pre = prefix[p];
          for(let s = 0; s < pre.schema.values.length; ++s){
            const schem = pre.schema.values[s];
            const re = new RegExp(`<${pre.id}:${schem}>(.+)\<\/${pre.id}:${schem}>`, 'gms');
            const tmpTags:any = re.exec(tags[0]);
            if(tmpTags){
              obj[p][schem] = [];
              while ((tt = regLi.exec(tmpTags)))
              {
                if(!obj[p][schem].includes(tt[1])) obj[p][schem].push(tt[1]);
              };
              // Si le tableau n'a qu'un valeur, on en fait une chaîne de caractère
              if(obj[p][schem].length < 2) obj[p][schem] = obj[p][schem].join();
            }
          }
        }
      }
      // Ajouter les informations sur le média
      if(!obj['oai_media']) obj['oai_media'] = {};
      obj['oai_media']['size'] = liste.Contents[i].Size;
      obj['oai_media']['url'] = 'https://' + BUCKET + '.s3.eu-west-3.amazonaws.com/' + liste.Contents[i].Key;
      obj['oai_media']['file'] = liste.Contents[i].Key.split('/')[1];

      regXML.lastIndex = 0;
      regTags.lastIndex = 0;
      
      metas.push(obj);
    }
    return metas;
  }
}