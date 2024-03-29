import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as S3 from 'aws-cdk-lib/aws-s3';
// import * as S3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cr from 'aws-cdk-lib/custom-resources';
// import * as iam from 'aws-cdk-lib/aws-iam';
// import console = require('console');

import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { join } from 'path';

import { collectionsStack, noticesStack, LambdaI, configStack } from '../models/lambdas';
// import { Bucket } from 'aws-cdk-lib/aws-s3';

export class FondsGpInfraStack extends cdk.Stack {

  UID: any;
  outputDB: any; // Database receiving configuration data from CDK (Lambdas Functions URLs)
  gets: any = {}; // Item with 'gets' lambdas
  edits: any = {}; // Item with 'edits' lambdas
  // nemaConfig:Bucket;
  deploy:any;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.UID = this.setStackParams(); // Get UID
    // Create buckets
    const buck:S3.Bucket = new S3.Bucket(this, 'fgpsets', {
      publicReadAccess: true,
      blockPublicAccess: new S3.BlockPublicAccess({
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      })
    });
    buck.grantPublicAccess();
    // LAMBDAS
    // List needed to save configurations
    configStack.lambdas.forEach((l, i) => {
      if (!configStack.db && l.table) configStack.db = this.setDBTable(l.table);
      // Lambda created
      l.lambda = this.setLambda(l, configStack.db!, l.bucket ? buck : undefined);
      // Create function URL for the Lambda
      l.lambda.addFunctionUrl(this.setFnUrl(l));
      // Give right to accessing database
      if(l.table) configStack.db!.grantReadWriteData(l.lambda);
      if(l.bucket) buck.grantRead(l.lambda);
    });
    // List needed collections
    collectionsStack.lambdas.forEach((l, i) => {
      if (!collectionsStack.db && l.table) collectionsStack.db = this.setDBTable(l.table);
      // Lambda created
      l.lambda = this.setLambda(l, collectionsStack.db!, l.bucket ? buck : undefined);
      // Create function URL for the Lambda
      l.lambda.addFunctionUrl(this.setFnUrl(l));
      // Give right to accessing
      if(l.table) collectionsStack.db!.grantReadWriteData(l.lambda);
      if(l.bucket) buck.grantRead(l.lambda);
    });
    // List needed notices
    noticesStack.lambdas.forEach((l, i) => {
      if (!noticesStack.db && l.table) noticesStack.db = this.setDBTable(l.table!);
      // Lambda created
      l.lambda = this.setLambda(l, noticesStack.db!, l.bucket ? buck : undefined);
      // Create function URL for the Lambda
      const fUrl = l.lambda.addFunctionUrl(this.setFnUrl(l));
      this.setItem(l, fUrl.url);
      // Giving rights to DB and buckets
      if(l.table) noticesStack.db!.grantReadWriteData(l.lambda);
      if(l.bucket) buck.grantRead(l.lambda);
      // this.nemaConfig.grantRead(l.lambda);
    });
  }
  /** Récupérer l'UID en paramètre qui permettra de créer des ressources en lien avec la pile
   * Il est transmis avec --parameters (cdk deploy --parameters UID=IAM:UserID) https://docs.aws.amazon.com/cdk/v2/guide/parameters.html
   * exemple : https://bobbyhadz.com/blog/aws-cdk-parameters-example
  */
  setStackParams() {
    return new cdk.CfnParameter(this, 'UID', {
      type: 'String',
      default: Math.random().toString(36).substring(0, 7), // Création d'une valeur par défaut au cas ou la paramètre ne serait pas transmis
      description: "UID de l'utilisateur",
    }).valueAsString;
  }
  // Créer un nom intégrant l'UID
  setNameID(str: string) {
    return str + '-' + this.UID;
  }
  /** Create a lambda */
  setLambda(l: LambdaI, db?: Table, buck?:S3.Bucket) {
    const lambda = new NodejsFunction(this, l.name, {
      entry: join(__dirname, '../Lambdas', l.file),
      ...this.setLambdaParams(l, db ?? db, buck ?? buck, l.params?.memory ?? l.params?.memory, l.params?.duration ?? l.params?.duration)
    });
    return lambda;
  }
  /** Set DynamoDB table */
  setDBTable(table: string): Table {
    const db = new Table(this, table, {
      partitionKey: {
        name: 'id' + table.substring(3,table.length-1),
        type: AttributeType.STRING
      },
      tableName: table,
      // Ce paramètre va nous permettre de décider si nous voulons détruire la table avec 'cdk destroy'
      // RETAIN est le paramètre par défaut. Il nécessite une destruction manuelle de la base
      // removalPolicy: cdk.RemovalPolicy.DESTROY // A supprimer en production
    });
    return db;
  }
  /** Set parameters for Lambdas */
  setLambdaParams(l:LambdaI, db?:Table, buck?:S3.Bucket, memory:number=128, duration:number=3): NodejsFunctionProps {
    const params: NodejsFunctionProps = {
      // Library to add
      bundling: {
        externalModules: ['aws-sdk']
      },
      depsLockFilePath: join(__dirname, '../Lambdas', 'package-lock.json'),
      memorySize: memory, // Gérer la taille de la mémoire de la lambda
      timeout:cdk.Duration.seconds(duration),
      /** Donner des variables d'environnement pour les rendre accessibles à la lambda (transmises) */
      environment: {
        PRIMARY_KEY: 'id' + l.table?.substring(3, l.table?.length-1),
        DB_T_NAME: db ? db.tableName : 'null', // Table ajoutée en paramètre d'environnement pour la récupérer dans la Lambda
        BUCKET: l.bucket ? buck!.bucketName : 'null'
      },
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      layers: l.layers ? this.setLayers(l.layers) : []
    };
    return params;
  }  
  /** Set methods for Function URL with methods */
  setFnURLMethods(met: Array<string>) {
    const methods: Array<any> = [];
    met.forEach(m => {
      switch (m) {
        case 'GET':
          methods.push(lambda.HttpMethod.GET);
          break;
        case 'HEAD':
          methods.push(lambda.HttpMethod.HEAD);
          break;
        case 'POST':
          methods.push(lambda.HttpMethod.POST);
          break;
        case 'PUT':
          methods.push(lambda.HttpMethod.PUT);
          break;
        case 'DELETE':
          methods.push(lambda.HttpMethod.DELETE);
          break;
        case 'PATCH':
          methods.push(lambda.HttpMethod.PATCH);
          break;
      }
    });
    return methods;
  }
  /** Set Function URL for lambdas */
  setFnUrl(l: LambdaI) {
    // Générate Function URL to lambda
    return {
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        // Tableau de chaînes listant les domaines accessibles
        allowedOrigins: l.origins ? l.origins : ['*'],
        // Méthodes autorisées
        allowedMethods: this.setFnURLMethods(l.methods)
      }
    }
  }
  /** Set item */
  setItem(l: LambdaI, url: string) {
    if (l.methods.includes('GET')) {
      this.gets[l.name] = url;
    }else if(l.methods.includes('POST')){
      this.edits[l.name] = url;
    }
  }
  /** Create layers for lambdas (up to 5) */
  setLayers(c:Array<any>){
    const layers:Array<any> = [];
    c.forEach(lay => {
      let tmpLayer = new lambda.LayerVersion(this, lay.name+'layer', {
        compatibleRuntimes: [
          lambda.Runtime.NODEJS_12_X,
          lambda.Runtime.NODEJS_14_X,
          lambda.Runtime.NODEJS_16_X
        ],
        code: lambda.Code.fromAsset(lay.file),
        description: `Add ${lay.name} to lambda`,
      });
      layers.push(tmpLayer);
    });
    return layers;
  }
  /** Save outputs to get Lambdas URL list (not used)*/
  // saveOutPut(table: string, item: any) {
  //   new cr.AwsCustomResource(this, 'configurationstable', {
  //     onCreate: {
  //       service: 'DynamoDB',
  //       action: 'putItem',
  //       parameters: {
  //         TableName: table,
  //         Item: item
  //       },
  //       physicalResourceId: cr.PhysicalResourceId.of(table + '_initialization')
  //     },
  //     policy: cr.AwsCustomResourcePolicy.fromSdkCalls({ resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE }),
  //   });
  // }
}
