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
    proxy?:boolean;
    params?:{memory?:number, duration?:number};
}
interface LambdasStackI{
    db?:Table;
    lambdas:Array<LambdaI>;
}
/** Arrays of lambadas to create for collections */
const collectionsLambdas:Array<LambdaI> = [
    { name: 'collectionsget', file: 'get.ts', table:'fgpcollections', methods:['GET', 'HEAD', 'POST'] },
    // { name: 'collectionsedit', file: 'edit.ts', table:'fgp-collections', methods:['POST', 'PUT', 'DELETE'] },
    { name: 'collectionsCreate', file: 'create.ts', table:'fgpcollections', methods:['POST'] },
    { name: 'collectionsUpdate', file: 'update.ts', table:'fgpcollections', methods:['PUT'] },
    { name: 'collectionsDel', file: 'delete.ts', table:'fgpcollections', methods:['DELETE'] },
];
export const collectionsStack:LambdasStackI = {
    lambdas : collectionsLambdas
}
/** Arrays of lambdas to create for notices */
const noticesLambdas:Array<LambdaI> = [
    { name: 'noticesget', file: 'get.ts', table:'fgpnotices', methods:['GET', 'HEAD', 'POST'] },
    // { name: 'noticesedit', file: 'edit.ts', table:'fgpnotices', methods:['POST', 'PUT', 'DELETE'] },
    { name: 'noticesCreate', file: 'create.ts', table:'fgpnotices', methods:['POST'] },
    { name: 'noticesUpdate', file: 'update.ts', table:'fgpnotices', methods:['PUT'] },
    { name: 'noticesDel', file: 'delete.ts', table:'fgpnotices', methods:['DELETE'] },
    { name: 'search', file: 'search.ts', table:'fgpnotices', methods:['GET', 'POST'], params:{memory:512, duration:300} },
    { name: 'oaipmh', file: 'oai-pmh.ts', table:'fgpnotices,fgpcollections', methods:['GET', 'HEAD', 'POST'], proxy:true },
];
export const noticesStack:LambdasStackI = {
    lambdas : noticesLambdas
}
/** Configuration services */
/** Arrays of lambdas to create for notices */
const configLambdas:Array<LambdaI> = [
    { name: 'configget', file: 'get.ts', table:'fgpconfigs', methods:['GET', 'HEAD'] },
    // { name: 'configedit', file: 'edit.ts', table:'fgp-configurations', methods:['POST', 'PUT', 'DELETE'] },
    { name: 'configCreate', file: 'create.ts', table:'fgpconfigs', methods:['POST'] },
    { name: 'configUpdate', file: 'update.ts', table:'fgpconfigs', methods:['PUT'] },
    { name: 'configDel', file: 'delete.ts', table:'fgpconfigs', methods:['DELETE'] },
    { name: 'xmp', file: 'xmp.ts', table:'fgpconfigs', bucket:'fgpsets', methods:['GET', 'HEAD', 'POST'], params:{memory:512, duration:300} }
];
export const configStack:LambdasStackI = {
    lambdas : configLambdas
}