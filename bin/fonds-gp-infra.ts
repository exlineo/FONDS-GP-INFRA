#!/usr/bin/env node
// Des exemples de tout et de rien : https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript
// Passer des données lors de la publications (cdk --context) : https://docs.aws.amazon.com/cdk/v2/guide/context.html
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FondsGpInfraStack } from '../lib/fonds-gp-infra-stack';
import { FGPApiStack } from '../lib/fonds-gp-api-stack';

const app = new cdk.App();
const infra = new FondsGpInfraStack(app, 'FondsGpInfraStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
const api = new FGPApiStack(app, 'FondsGpInfraApi');