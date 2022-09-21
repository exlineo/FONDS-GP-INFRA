import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

export interface LambdaI {
    name: string;
    file: string;
    lambda?: NodejsFunction;
    table?:string;
    bucket?:string;
    methods:Array<any>;
    layers?:Array<any>;
    origins?:Array<string>;
}
interface LambdasStackI{
    db?:Table;
    lambdas:Array<LambdaI>;
}
/** Arrays of lambadas to create for collections */
const collectionsLambdas:Array<LambdaI> = [
    { name: 'collectionsget', file: 'get.ts', table:'collections', methods:['GET', 'HEAD', 'POST'] },
    { name: 'collectionsedit', file: 'edit.ts', table:'collections', methods:['POST', 'PUT', 'DELETE'] },
];
export const collectionsStack:LambdasStackI = {
    lambdas : collectionsLambdas
}
/** Arrays of lambdas to create for notices */
const noticesLambdas:Array<LambdaI> = [
    { name: 'noticesget', file: 'get.ts', table:'notices', methods:['GET', 'HEAD', 'POST'] },
    { name: 'noticesedit', file: 'edit.ts', table:'notices', methods:['POST', 'PUT', 'DELETE'] },
    { name: 'xmp', file: 'xmp.ts', table:'notices', bucket:'sets', methods:['GET', 'HEAD', 'POST', 'PUT'], layers:[{name:'exiflayer', file:'./Lambdas/nodejs.zip'}] },
    { name: 'oaipmh', file: 'oai-pmh.ts', table:'notices', methods:['GET', 'HEAD', 'POST'] },
];
export const noticesStack:LambdasStackI = {
    lambdas : noticesLambdas
}
/** Configuration services */
/** Arrays of lambdas to create for notices */
const configLambdas:Array<LambdaI> = [
    { name: 'configget', file: 'get.ts', table:'configurations', methods:['GET', 'HEAD'] },
    { name: 'configedit', file: 'edit.ts', table:'configurations', methods:['POST', 'PUT', 'DELETE'] },
];
export const configStack:LambdasStackI = {
    lambdas : configLambdas
}