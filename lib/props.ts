import {StackProps} from "aws-cdk-lib";
import {IQueue} from "aws-cdk-lib/aws-sqs";

export interface AppProps extends StackProps {
    appName: string;
    stage: string;
}

export interface SnsProps extends AppProps {
    readonly sqs: IQueue;
}
