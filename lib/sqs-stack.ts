import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { AppProps } from "./props";

export class SqsStack extends Stack {
  public readonly queue: Queue;

  constructor(scope: Construct, id: string, readonly props: AppProps) {
    super(scope, id, props);

    const queueID = `${props.appName}-${props.stage}-queue`;
    const queueName = queueID;
    this.queue = new Queue(this, queueID, {
      queueName: queueName,
      visibilityTimeout: Duration.seconds(10),
    });
  }
}
