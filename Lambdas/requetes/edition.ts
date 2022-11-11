import { L } from '../traductions/fr';
import * as AWS from 'aws-sdk';
// import { request } from 'http';

// Accessing DYnamoDB table
const db = new AWS.DynamoDB.DocumentClient();

/** Create on PUT request */
export const createData = async (body: any, KEY: string, BDD: string) => {
    if (Array.isArray(body)) {
        return createListData(body, KEY, BDD);
    } else {
        return createItem(body, KEY, BDD);
    }
}
export const createItem = async (body: any, KEY: string, BDD: string) => {
    // Paramètres transmis dans la requête vers DynamoDB
    const params = {
        TableName: BDD,
        Item: body
    };
    // Requête vers DynamoDB
    try {
        const response = await db.put(params).promise();
        return { statusCode: 201, body: response.ItemCollectionMetrics };
    } catch (er) {
        return { statusCode: 500, body: JSON.stringify(er) };
    }
}
/** Create list of objects */
export const createListData = async (body: Array<any>, PRIMARY: string, BDD: string) => {
    try {
        let set = [];
        let ids = [];
        const n = Math.ceil(body.length / 25);
        for(let i=0; i<= n; ++i){
            const m = i*25;
            set = body.slice(m, (i == n) ? body.length : m+25);
            const response = await db.batchWrite(generateBatchListPut(set, BDD)).promise();
            ids.push(response.ItemCollectionMetrics);
        };
        return { statusCode: 204, body: ids }
    } catch (er) {
        return { statusCode: 500, body: JSON.stringify(er) }
    }
}
/** Update on POST request */
export const updateData = async (body: any, KEY: string, BDD: string) => {
    const expressions: Array<string> = [];
    const values: any = {};
    for (let i in body) {
        if (i != KEY) {
            expressions.push(`${i} = :${i}`);
            values[`:${i}`] = body[i];
        }
    }
    const expression = 'set ' + expressions.join();

    // Parameters send to DynamoDB
    const params: any = {
        TableName: BDD,
        Key: {
            [KEY]: body[KEY]
        },
        UpdateExpression: expression,
        ExpressionAttributeValues: values,
        ReturnValues: 'UPDATED_NEW'
    }

    // Requête vers DynamoDB
    try {
        const response = await db.update(params).promise();
        return { statusCode: 204, body: response.ItemCollectionMetrics };
    } catch (er: any) {
        // const errorResponse = er.code === 'ValidationException' && er.message.includes('reserved keyword') ?
        // DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: JSON.stringify(er) };
    }
}
/** Delete collection */
export const deleteData = async (body: any, KEY: string, BDD: string) => {
    // Paramètres transmis dans la requête vers DynamoDB
    const params = {
        TableName: BDD,
        Key: {
            [KEY]: body[KEY]
        }
    };
    // Requête vers DynamoDB
    try {
        const response = await db.delete(params).promise();
        return { statusCode: 200, body: response.ItemCollectionMetrics };
    } catch (er) {
        return { statusCode: 500, body: JSON.stringify(er) };
    }
}
/** Generate batch put item request */
const generateBatchListPut = (body: Array<any>, bdd: string) => {
    const items: Array<any> = body.map((item: { PutRequest: { Item: any; } }, i: number) => {
        // Limit insert to 25 objects (dynamoDB limit)
        if (i < 25) {
            return {
                PutRequest: {
                    Item: item
                }
            }
        }
        // return;
    });
    const request = {
        RequestItems: {
            [bdd]: items
        }
    }
    return request;
}