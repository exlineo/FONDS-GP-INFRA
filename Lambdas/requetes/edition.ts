import { L } from '../traductions/fr';
import * as AWS from 'aws-sdk';
// import { request } from 'http';

// Accessing DYnamoDB table
const db = new AWS.DynamoDB.DocumentClient();

/** Create on PUT request */
export const createData = async (body: any, KEY: string, BDD: string) => {
    if (Array.isArray(body)) {
        return requestList(body, KEY, BDD, 'put');
    } else {
        return createItem(body, BDD);
    }
}
const createItem = async (body: any, BDD: string) => {
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
/** Delete item or list of items */
export const deleteData = async (body: any, KEY: string, BDD: string) => {
    if (Array.isArray(body)) {
        return requestList(body, KEY, BDD, 'del');
    } else {
        return deleteItem(body, KEY, BDD);
    }
}
/** Delete an item from database */
const deleteItem = async (id: any, KEY: string, BDD: string) => {
    // Paramètres transmis dans la requête vers DynamoDB
    const params = {
        TableName: BDD,
        Key: { [KEY]: id }
    };
    // Delete request on a single object
    try {
        const response = await db.delete(params).promise();
        return { statusCode: 200, body: response.ItemCollectionMetrics };
    } catch (er) {
        return { statusCode: 500, body: JSON.stringify(er) };
    }
};
/** Create list of objects */
const requestList = async (body: Array<any>, KEY: string, BDD: string, type:string) => {
    try {
        let items = [];
        const t = body.length;
        const n = Math.floor(t / 25);
        for (let i = 0; i <= n; ++i) {
            const m = i * 25;
            items = body.slice(m, (i == n) ? t : m + 25);
            if (items.length > 0) {
                const response = await db.batchWrite(generateBatch(items, KEY, BDD, type)).promise();
            } else {
                break;
            }
        };
        return { statusCode: 200, body: { message:L.ADD }}
    } catch (er) {
        return { statusCode: 500, body: JSON.stringify(er) }
    }
}
/** Generate batch put item request */
const generateBatch = (items: Array<any>, key: string, bdd: string, type: string) => {
    const reqIems: Array<any> = items.map((item: any, i: number) => {
        switch (type) {
            case 'put':
                return {
                    PutRequest: {
                        Item: item
                    }
                }
            case 'up':
                return {
                    PutRequest: {
                        Item: item
                    }
                }
            case 'del':
                return {
                    DeleteRequest: {
                        Key: { [key]: item }
                    }
                }
        }

    });
    const request = {
        RequestItems: {
            [bdd]: reqIems
        }
    }
    return request;
}