import {App, StackProps} from "aws-cdk-lib";
import {IQueue} from "aws-cdk-lib/aws-sqs";
import {AppConfigStack} from "./appconfig-stack";

export interface AppProps extends StackProps {
    appName: string;
    stage: string;
}

export interface SnsProps extends AppProps {
    readonly sqs: IQueue;
}

export interface AppConfigProfileProps {
    key: string,
    value: string,
    type: string
}

export interface AppConfigProps extends AppProps {
    readonly appConfigProfileProps: AppConfigProfileProps[];
}
