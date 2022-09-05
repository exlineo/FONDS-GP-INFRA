// import * as AWS from 'aws-sdk';

export const handler = async(event:any={}):Promise<any> => {
  if (!event.body) {
    return { statusCode: 400, body: "Paramètres erronés, il n'y a pas de body" };
  }
  
  return { statusCode: 201, body: event.body };
}