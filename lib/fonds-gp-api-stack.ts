import { IResource, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi, IntegrationResponse, Cors, MethodResponse, RestApiProps } from 'aws-cdk-lib/aws-apigateway';
import { App, Stack, StackProps } from 'aws-cdk-lib';

import { collectionsStack, noticesStack, LambdaI, configStack } from '../models/lambdas';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

export class FGPApiStack extends Stack {

    lambdas:any;
    api:RestApi;
    intResp:Array<IntegrationResponse> = [{
            statusCode: '200',
            responseParameters: {
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                'method.response.header.Access-Control-Allow-Origin': "'*'",
                'method.response.header.Access-Control-Allow-Credentials': "'false'",
                'method.response.header.Access-Control-Allow-Methods': "'GET,POST,HEAD,PUT,DELETE,PATCH'",
            }
        }];
    metResp:Array<MethodResponse> = [{
            statusCode: '200',
            responseParameters: {
                'method.response.header.Access-Control-Allow-Headers': true,
                'method.response.header.Access-Control-Allow-Methods': true,
                'method.response.header.Access-Control-Allow-Credentials': true,
                'method.response.header.Access-Control-Allow-Origin': true,
            },
        }];

    constructor(app: App, id: string, props?:StackProps) {
        super(app, id);

        // Create an API Gateway resource for each of the CRUD operations
        this.api = new RestApi(this, 'FGPInfraApi', {
            restApiName: 'FGP API Rest',
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS
              },
            cloudWatchRole : true, // Add role to cloudwatch
            // deploy: false // Force deployment on deploy
        });
        // Create routes in API
        this.setAPIResource(configStack.lambdas, 'config');
        this.setAPIResource(collectionsStack.lambdas, 'collections');
        this.setAPIResource(noticesStack.lambdas, 'notices');
    };
    // Create API resource from lists of lambdas
    setAPIResource(lambdas:Array<LambdaI>, name:string){
        const root = this.api.root.addResource(name);
        lambdas.forEach( l => {
            // If lambda is for edition
            if(l.file == 'edit.ts') {
                const edit = root.addResource('edit');
                this.setAPIResourceMethods(edit, l.methods, l.lambda!);
            }else if(l.file == "get.ts"){
                this.setAPIResourceMethods(root, l.methods, l.lambda!);
            }else{
                const res = this.api.root.addResource(l.name);
                this.setAPIResourceMethods(res, l.methods, l.lambda!);
            }
        })
    }
    // Create lambda integration and add mehods and cors to API route
    setAPIResourceMethods(resource:IResource, methods:Array<string>, lambda:any){
        // Create integration with the lambda inside l
        const lambdaIntegration = new LambdaIntegration(lambda as IFunction, { 
            proxy: true,
            integrationResponses:this.intResp
         });
        // Add methods in route from the methode of the resource
        methods.forEach( m => {
            resource.addMethod(m, lambdaIntegration, {
                methodResponses:this.metResp
            });
        });
        // Add cors for route
        // this.addCorsOptions(resource, methods.toString());
    }
    // Adding CORS to resource
    addCorsOptions(apiResource: IResource, methods:string) {
        apiResource.addMethod('OPTIONS', new MockIntegration({
            integrationResponses: [{
                statusCode: '200',
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                    'method.response.header.Access-Control-Allow-Origin': "'*'",
                    'method.response.header.Access-Control-Allow-Credentials': "'false'",
                    'method.response.header.Access-Control-Allow-Methods': "'GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS'",
                },
            }],
            passthroughBehavior: PassthroughBehavior.NEVER,
            requestTemplates: {
                "application/json": "{\"statusCode\": 200}"
            },
        }), {
            methodResponses: [{
                statusCode: '200',
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                    'method.response.header.Access-Control-Allow-Credentials': true,
                    'method.response.header.Access-Control-Allow-Origin': true,
                },
            }]
        })
    }
}