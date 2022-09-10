import { L } from '../traductions/fr';
import * as AWS from 'aws-sdk';;

// Accessing DYnamoDB table
const db = new AWS.DynamoDB.DocumentClient();

/** Create on PUT request */
export const createData = async (body: any, KEY: string, BDD: string) => {
    // Paramètres transmis dans la requête vers DynamoDB
    const params = {
        TableName: BDD,
        Item: body
    };
    // Requête vers DynamoDB
    try {
        const response = await db.put(params).promise();
        return { statusCode: 201, body: L.ADD };
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
        return { statusCode: 204, body: L.UPDATE };
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
        return { statusCode: 200, body: L.DEL };
    } catch (er) {
        return { statusCode: 500, body: JSON.stringify(er) };
    }
}