#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsCdkDemoStack } from '../lib/aws-cdk-demo-stack';

const app = new cdk.App();
new AwsCdkDemoStack(app, 'AwsCdkDemoStack');
