import { autoscaling, ec2 } from '@pulumi/aws';
import { Image } from '@pulumi/docker';
import { interpolate } from '@pulumi/pulumi';
import { physicalZoneSubnetId } from './ec2';
import { targetGroup } from './lb';

export const createAsg = (launchTemplate: ec2.LaunchTemplate, dockerImage: Image) =>
  new autoscaling.Group(
    'sai-asg',
    {
      desiredCapacity: 1,
      minSize: 1,
      maxSize: 4, // This is good for old instance spindown headroom (we're limiting concurrency in GHA)
      vpcZoneIdentifiers: [physicalZoneSubnetId],
      instanceRefresh: {
        strategy: 'Rolling',
        preferences: {
          minHealthyPercentage: 50,
        },
        triggers: ['tag'],
      },
      launchTemplate: {
        id: launchTemplate.id,
        version: '$Default',
      },
      healthCheckType: 'ELB',
      targetGroupArns: [targetGroup.arn],
      healthCheckGracePeriod: 60,
      tags: [
        {
          key: 'deploymentGroup',
          value: 'sai-demo',
          propagateAtLaunch: true,
        },
        {
          key: 'ecrDigest',
          value: interpolate`${dockerImage.repoDigest}`,
          propagateAtLaunch: true,
        },
      ],
    },
    { dependsOn: [launchTemplate, dockerImage] }
  );
