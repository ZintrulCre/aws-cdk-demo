#!/usr/bin/env node
import {App} from "aws-cdk-lib";
import {SnsStack} from "../lib/sns-stack";
import {SqsStack} from "../lib/sqs-stack";
import {AppConfigStack} from "../lib/appconfig-stack";
import {AppProps} from "../lib/props";

const app = new App();
const appName = "AwsCdkDemo";
const appProps: AppProps = {
    appName: appName,
    stage: "Beta",
};

const sqsStack = new SqsStack(app, `${appName}-SQS`, appProps);

const snsStack = new SnsStack(app, `${appName}-SNS`, {
    ...appProps,
    sqs: sqsStack.queue,
});

const appConfigStack = new AppConfigStack(app, `${appName}-AppConfig`, appProps);