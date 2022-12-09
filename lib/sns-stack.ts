import { Stack } from "aws-cdk-lib";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { SnsProps } from "./props";

export class SnsStack extends Stack {
  readonly topic: Topic;

  constructor(scope: Construct, id: string, readonly props: SnsProps) {
    super(scope, id, props);

    const topicID = `${props?.appName}-${props?.stage}-topic`;
    const topicName = topicID;
    this.topic = new Topic(this, topicID, {
      topicName: topicName,
    });

    this.topic.addSubscription(new SqsSubscription(props.sqs));
  }
}
