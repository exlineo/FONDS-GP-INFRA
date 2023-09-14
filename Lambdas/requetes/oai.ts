import { L } from '../traductions/fr';
import * as AWS from 'aws-sdk';;

// Accessing DYnamoDB table
const db = new AWS.DynamoDB.DocumentClient();
/** Get one item from table */
export const getIdPrefix = async (PRIMARY: string, KEY: string, BDD: string, prefixes?:string) => {
    const params: { TableName: string, Key: any, ProjectionExpression?:string } = {
        TableName: BDD,
        Key: { [PRIMARY]: KEY }
    };
    if(prefixes){
        params.ProjectionExpression = setPrefixProjection(PRIMARY, prefixes)
    }
    // Get data from DynamoDB in table
    try {
        const response = await db.get(params).promise();
        if (response.Item) {
            return response.Item;
        } else {
            return { statusCode: 404 };
        }
    } catch (er) {
        // return { statusCode: 500, body : JSON.stringify(er) };
        return er;
    }
}
/**
 * Get filtered data from table in Dynamodb
 * @param PRIMARY Primary key name in table
 * @param KEY Table primary ky value
 * @param filter {any} List of filter to select data ; take the form of key|value
 * @param haveTo {any} List parameters to informations on what to get inside a record
 * @param BDD Table name
 * @returns 
 */
export const getRecByPrefix = async (PRIMARY: string, KEY: string, BDD: string, haveTo?: any) => {
    // const expressions: Array<string> = [];s
    // const values: any = {};
    // Parameters send to DynamoDB
    const params: any = {
        TableName: BDD
        // ProjectionExpression:`${PRIMARY}`
    }
    // set contains and projectionExpression from haveTo variable
    if(haveTo){
        params.FilterExpression = setPrefixesContains(haveTo);
        params.ProjectionExpression = setPrefixProjection(PRIMARY, haveTo)
    }
    // Requête vers DynamoDB
    try {
        const response = await db.query(params).promise();
        return response.Items;
    } catch (er: any) {
        return er;
    }
}
/**
 * Get filtered data from table in Dynamodb
 * @param PRIMARY Primary key name in table
 * @param KEY Table primary ky value
 * @param filter {any} List of filter to select data ; take the form of key|value
 * @param haveTo {any} List parameters to informations on what to get inside a record
 * @param BDD Table name
 * @returns 
 */
export const getFilterRec = async (PRIMARY: string, KEY: string, BDD: string, filter: any, haveTo?: any) => {
    const expressions: Array<string> = [];
    const values: any = {};
    // Set expression from filters
    for (let i in filter) {
        if (i != KEY) {
            expressions.push(`${i} = :${i}`);
            values[`:${i}`] = filter[i];
        }
    }
    const expression = expressions.join();
    // Parameters send to DynamoDB
    const params: any = {
        TableName: BDD,
        Key: {
            [PRIMARY]: KEY
        },
        KeyConditionExpression: expression,
        ExpressionAttributeValues: values,
    }
    // set contains from... contains
    if(haveTo){
        params.FilterExpression = setPrefixesContains(haveTo);
    }
    // Requête vers DynamoDB
    try {
        const response = await db.query(params).promise();
        return response.Items;
    } catch (er: any) {
        return er;
    }
}
/** 
 * Get prefixes from requests to set contains in request
 * @params prefix {string} Prefix from request, could be many separated by comma
 * */
const setPrefixesContains = (prefix: string):string => {
    let contains = '';
    // Get prefixes as list from request (allow many prefixes in requests)
    if (prefix.indexOf(',') > -1) {
        const prefixes = prefix.split(',');
        prefixes.forEach((p, i) => {
            if (i == 0) {
                contains = `contains (prefix, ${p})`
            } else {
                contains += ` OR contains (prefix, ${p})`
            }
        });
    }else{
        contains = `contains (prefix, ${prefix})`;
    }
    return contains;
}
/**
 * Set ProjectionExpression to list all fields to get from the database
 * @param key Primary key of the table to get in the records
 * @param prefix data linked to asked prefixs
 * @returns 
 */
const setPrefixProjection = (key:string, prefix:any) => {
    let projection = `${key}`;
    // Get prefixes as list from request (allow many prefixes in requests)
    if (prefix.indexOf(',') > -1) {
        const prefixes = prefix.split(',');
        prefixes.forEach((p:string) => {
            projection += `, ${p.substring(4, p.length)}`;
        });
    } else {
        projection += `, ${prefix.substring(4, prefix.length)}`;
    };
    return projection;
}