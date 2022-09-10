import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

export interface LambdaI {
    name: string;
    file: string;
    lambda?: NodejsFunction;
    table:string;
    methods:Array<any>;
    origins?:Array<string>;
}
interface LambdasStackI{
    db?:Table;
    lambdas:Array<LambdaI>;
}
/** Arrays of lambadas to create for collections */
const collectionsLambdas:Array<LambdaI> = [
    { name: 'collectionsget', file: 'get.ts', table:'collections', methods:['GET', 'HEAD'] },
    { name: 'collectionsedit', file: 'edit.ts', table:'collections', methods:['POST', 'PUT', 'DELETE'] },
];
export const collectionsStack:LambdasStackI = {
    lambdas : collectionsLambdas
}
/** Arrays of lambdas to create for notices */
const noticesLambdas:Array<LambdaI> = [
    { name: 'noticesget', file: 'get.ts', table:'notices', methods:['GET', 'HEAD'] },
    { name: 'noticesedit', file: 'edit.ts', table:'notices', methods:['POST', 'PUT', 'DELETE'] },
    { name: 'oaipmh', file: 'oai-pmh.ts', table:'notices', methods:['GET', 'HEAD'] }
];
export const noticesStack:LambdasStackI = {
    lambdas : noticesLambdas
}