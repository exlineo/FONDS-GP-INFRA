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
const listeCollectionsLambdas:Array<LambdaI> = [
    { name: 'collections-get', file: 'collections-get.ts', table:'collections', methods:['GET', 'HEAD'] },
    { name: 'collections-post', file: 'collections-post.ts', table:'collections', methods:['POST', 'PUT'] },
    { name: 'collections-add', file: 'collections-add.ts', table:'collections', methods:['POST']  },
    { name: 'collections-delete', file: 'collections-delete.ts', table:'collections', methods:['DELETE']}
];
const listeNoticesLambdas:Array<LambdaI> = [
    { name: 'notices-get', file: 'notices-get.ts', table:'notices', methods:['GET', 'HEAD'] },
    { name: 'notices-post', file: 'notices-post.ts', table:'notices', methods:['POST', 'PUT'] },
    { name: 'notices-add', file: 'notices-add.ts', table:'notices', methods:['POST']  },
    { name: 'notices-delete', file: 'notices-delete.ts', table:'notices', methods:['DELETE']}
];
export const collectionsStack:LambdasStackI = {
    lambdas : listeCollectionsLambdas
}
export const noticesStack:LambdasStackI = {
    lambdas : listeNoticesLambdas
}