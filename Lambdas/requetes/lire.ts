import * as AWS from 'aws-sdk';

// Accessing DYnamoDB table
const db = new AWS.DynamoDB.DocumentClient();
/** Get one item from table */
export const getId = async (PRIMARY: string, KEY: string, BDD: string) => {
    const params: { TableName: string, Key: any } = {
        TableName: BDD,
        Key: { [PRIMARY]: KEY }
    };
    // Get data from DynamoDB in table
    try {
        const response = await db.get(params).promise();
        if (response.Item) {
            // return {statusCode:200, body: JSON.stringify(response.Item)};
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
 * @param Filter {Array<any>} List of filter to select data ; take the form of key|value
 * @param BDD Table name
 * @returns 
 */
export const getIdFilter = async (PRIMARY: string, KEY: string, filter:Array<any>, BDD: string) => {
    const expressions: Array<string> = [];
    const values: any = {};
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
        ReturnValues: 'UPDATED_NEW'
    }

    // Requête vers DynamoDB
    try {
        const response = await db.query(params).promise();
        return response.Items;
    } catch (er: any) {
        return er;
    }
}
/** Get many items from table with ids
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchGetItem-property
*/
export const bacthGetId = async (KEY: string, keys: Array<string>, BDD: string) => {
    // Get data from DynamoDB in table
    try {
        let items:Array<any> = [];
        let gap:Array<any> = [];
        const n = Math.floor(keys.length / 100);
        for (let i = 0; i <= n; ++i) {
            const m = i * 100;
            gap = keys.slice(m, (i == n) ? keys.length : m + 100);
            if (gap.length > 0) {
                const response:any = await db.batchGet(generateBatchListGet(KEY, gap, BDD)).promise();
                items = items.concat(...response.Responses[BDD]);
            }
        }
        // return { statusCode: 200, body: JSON.stringify(items) };
        return items;
    } catch (er) {
        // return { statusCode: 500, body : JSON.stringify(er) }
        return er;
    }
}
/** Get many items from many tables */

/** Get all items for table (max 100) */
export const getAll = async (BDD: string) => {
    // Paramètres transmis dans la requête vers DynamoDB
    const params: { TableName: string } = {
        TableName: BDD
    };
    // Get all data in table
    try {
        const response = await db.scan(params).promise();
        // return { statusCode: 200, body: JSON.stringify(response.Items) };
        return response.Items;
    } catch (er) {
        // return { statusCode: 500, body : JSON.stringify(er) };
        return er;
    }
}
/** Générate batch put item request */
const generateBatchListGet = (KEY: string, keys: Array<any>, BDD: string) => {
    const ids: Array<any> = keys.map((id: string, i: number) => {
        return { [KEY]: id }
    });
    const request = {
        RequestItems: {
            [BDD]: {
                Keys: ids
            }
        }
    }
    return request;
}
/** Search in database */
export const search = async (KEY:string, body:any, BDD: string) => {
    // Paramètres transmis dans la requête vers DynamoDB
    const params: { TableName: string } = {
        TableName: BDD
    };
    // Get all data in table
    try {
        const response = await db.scan(params).promise();
        // return {statusCode:200, body: JSON.stringify(response.Items)};
        return response.Items;
    } catch (er) {
        return er;
    }
}