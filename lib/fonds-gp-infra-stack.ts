import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as S3 from 'aws-cdk-lib/aws-s3';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as iam from 'aws-cdk-lib/aws-iam';
// import console = require('console');

import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { join } from 'path';

import { collectionsStack, noticesStack, LambdaI, configStack } from '../models/lambdas';

export class FondsGpInfraStack extends cdk.Stack {

  UID: any;
  outputDB: any; // Database receiving configuration data from CDK (Lambdas Functions URLs)
  gets: any = {}; // Item with 'gets' lambdas
  edits: any = {}; // Item with 'edits' lambdas

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.UID = this.setStackParams(); // Get UID
    // console.log('UID 👉 ', this.UID.valueAsString);
    // this.outputDB = this.setDBTable(configStack.lambdas[0].table);

    // LAMBDAS
    // List needed to save configurations
    configStack.lambdas.forEach((l, i) => {
      if (!configStack.db) configStack.db = this.setDBTable(l.table);
      // Lambda created
      l.lambda = this.setLambda(l, configStack.db);
      // Create function URL for the Lambda
      l.lambda.addFunctionUrl(this.setFnUrl(l));
      // Give right to accessing database
      configStack.db.grantReadWriteData(l.lambda);
    });
    // List needed collections
    collectionsStack.lambdas.forEach((l, i) => {
      if (!collectionsStack.db) collectionsStack.db = this.setDBTable(l.table);
      // Lambda created
      l.lambda = this.setLambda(l, collectionsStack.db);
      // Create function URL for the Lambda
      l.lambda.addFunctionUrl(this.setFnUrl(l));
      // Give right to accessing database
      collectionsStack.db.grantReadWriteData(l.lambda);
    });
    // List needed notices
    noticesStack.lambdas.forEach((l, i) => {
      if (!noticesStack.db) noticesStack.db = this.setDBTable(l.table);
      // Lambda created
      l.lambda = this.setLambda(l, noticesStack.db);
      // Create function URL for the Lambda
      const fUrl = l.lambda.addFunctionUrl(this.setFnUrl(l));
      console.log(fUrl.url);
      this.setItem(l, fUrl.url);
      // Give right to accessing database
      noticesStack.db.grantReadWriteData(l.lambda);
    });
    // Créer un bucket
    const buck = new S3.Bucket(this, 'sets');
    // 👇 export myBucket for cross-stack reference
    // new cdk.CfnOutput(this, 'MaBuckRef', {
    //   value: buck.bucketName,
    //   description: 'Le nom de buck',
    //   exportName: 'monBuck',
    // });
    // Créer un utilisateur et le connecter au groupe préparamétré
    // const group = iam.Group.fromGroupArn(this, 'clients', 'arn:aws:iam::631286241071:group/clients');
    // const user = new iam.User(this, this.UID);
    // user.addToGroup(group);
    // this.saveOutPut(configStack.lambdas[0].table, { idconfigurations:'init', gets: this.gets, edits: this.edits });
  }
  /** Récupérer l'UID en paramètre qui permettra de créer des ressources en lien avec la pile
   * Il est transmis avec --parameters (cdk deploy --parameters UID=IAM:UserID) https://docs.aws.amazon.com/cdk/v2/guide/parameters.html
   * exemple : https://bobbyhadz.com/blog/aws-cdk-parameters-example
  */
  async setStackParams() {
    return await new cdk.CfnParameter(this, 'UID', {
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
  setLambda(l: any, db: any) {
    const lambda = new NodejsFunction(this, l.name, {
      entry: join(__dirname, '../Lambdas', l.file),
      ...this.setLambdaParams(l.table, db)
    });
    return lambda;
  }
  /** Set DynamoDB table */
  setDBTable(table: string): Table {
    const db = new Table(this, table, {
      partitionKey: {
        name: 'id' + table,
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
  setLambdaParams(id: string, db: Table): NodejsFunctionProps {
    const params: NodejsFunctionProps = {
      // La librairie à ajouter
      bundling: {
        externalModules: ['aws-sdk']
      },
      depsLockFilePath: join(__dirname, '../Lambdas', 'package-lock.json'),
      memorySize: 128, // Paramètre pour montrer qu'il existe
      /** Donner des variables d'environnement pour les rendre accessibles à la lambda (transmises) */
      environment: {
        PRIMARY_KEY: 'id' + id,
        DB_T_NAME: db.tableName, // Table ajoutée en paramètre d'environnement pour la récupérer dans la Lambda
      },
      runtime: lambda.Runtime.NODEJS_16_X
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
    // const item = {
    //   id: this.UID,
    //   name: l.name,
    //   url,
    //   methods: l.methods
    // }
    if (l.methods.includes('GET')) {
      this.gets[l.name] = url;
    }else if(l.methods.includes('POST')){
      this.edits[l.name] = url;
    }
  }
  /** Save outputs  to get Lambdas URL list */
  saveOutPut(table: string, item: any) {
    new cr.AwsCustomResource(this, 'configurationstable', {
      onCreate: {
        service: 'DynamoDB',
        action: 'putItem',
        parameters: {
          TableName: table,
          Item: item
        },
        physicalResourceId: cr.PhysicalResourceId.of(table + '_initialization')
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({ resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE }),
    });
  }
}
