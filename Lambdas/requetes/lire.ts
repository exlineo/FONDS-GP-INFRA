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
            // return { statusCode: 200, body: response.Item };
            return {statusCode:200, body: JSON.stringify(response.Item)};
        } else {
            return { statusCode: 404 };
        }
    } catch (er) {
        return { statusCode: 500, body : JSON.stringify(er) };
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
        return { statusCode: 200, body: JSON.stringify(items) };
        // return items;
    } catch (er) {
        return { statusCode: 500, body : JSON.stringify(er) }
        // return er;
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
        return { statusCode: 200, body: JSON.stringify(response.Items) };
        // return response.Items;
    } catch (er) {
        return { statusCode: 500, body : JSON.stringify(er) };
        // return er;
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
        return {statusCode:200, body: JSON.stringify(response.Items)};
        // return response.Items;
    } catch (er) {
        return { statusCode: 500, body : JSON.stringify(er) };
    }
}