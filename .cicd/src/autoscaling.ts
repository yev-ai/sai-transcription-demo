import { autoscaling, ec2 } from "@pulumi/aws";
import { physicalZoneSubnetId } from "./ec2";
import { targetGroup } from "./lb";

export const createAsg = (launchTemplate: ec2.LaunchTemplate) =>
  new autoscaling.Group("sai-asg", {
    desiredCapacity: 1,
    minSize: 1,
    maxSize: 3,
    vpcZoneIdentifiers: [physicalZoneSubnetId],
    instanceRefresh: {
      strategy: "Rolling",
      preferences: {
        minHealthyPercentage: 50,
      },
    },
    launchTemplate: {
      id: launchTemplate.id,
      version: "$Default",
    },
    healthCheckType: "ELB",
    targetGroupArns: [targetGroup.arn],
    healthCheckGracePeriod: 120,
    tags: [
      {
        key: "deploymentGroup",
        value: "sai-demo",
        propagateAtLaunch: true,
      },
    ],
  });
