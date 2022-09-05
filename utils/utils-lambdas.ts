import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { join } from 'path';

import { LambdaI } from '../models/lambdas';

/** Generical properties for cors */
const fnURL = {
    authType: lambda.FunctionUrlAuthType.NONE,
    cors: {
      // Tableau de chaînes listant les domaines accessibles
      allowedOrigins: ['*'],
      // Méthodes autorisées
      allowedMethods: [lambda.HttpMethod.GET, lambda.HttpMethod.HEAD]
    }
  };
  
export class UtilsLambdas{

    scope:Construct;

    constructor(scope:Construct){
        this.scope = scope;
    }
    /** Create a lambda */
  setLambda(l:any, db:any){
    const lambda = new NodejsFunction(this.scope, l.name, {
      entry: join(__dirname, '../Lambdas', l.file),
      ...this.setParams(l.table, db)
    });
    return lambda;
  }
  /** Set DynamoDB table */
  setDBTable(table: string): Table {
    const db = new Table(this.scope, table + 'id', {
      partitionKey: {
        name: 'id' + table,
        type: AttributeType.STRING
      },
      tableName: table,
      // Ce paramètre va nous permettre de décider si nous voulons détruire la table avec 'cdk destroy'
      // RETAIN est le paramètre par défaut. Il nécessite une destruction manuelle de la base
      removalPolicy: cdk.RemovalPolicy.DESTROY // A supprime en production
    });
    return db;
  }
  /** Set parameters for Lambdas */
  setParams(id: string, db: Table): NodejsFunctionProps {
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
      runtime: lambda.Runtime.NODEJS_16_X,
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
}