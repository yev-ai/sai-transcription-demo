import { ec2 } from '@pulumi/aws';
import { Image } from '@pulumi/docker';
import { interpolate } from '@pulumi/pulumi';
import { appArgs, hostConfig, region, vpc } from './config';
import { ecrRepository } from './ecr';
import { ec2InstanceProfile } from './iam';
import { createPassword } from './password';

export const physicalZoneSubnetId = vpc.vpcId.apply(vpcId =>
  ec2 // Physical colocation workaround for AWS.
    .getSubnet({
      availabilityZone: hostConfig.physicalSubzone,
      filters: [{ name: 'vpc-id', values: [vpcId] }],
    })
    .then(subnet => subnet.id)
);

export const egressOnlySgId = new ec2.SecurityGroup('sai-egress-only', {
  vpcId: vpc.vpcId,
  description: 'Security group that allows only outbound traffic',
  egress: [
    {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ['0.0.0.0/0'],
    },
  ],
}).id;

export const serialConsolePassword = createPassword(`unwisely-nonrotated`);

// Env vars should *REALLY* be in AWS Secret or Systems Manager but I've gotta get a bunch of stuff done today before interview :( sorry!
export const getUserData = (dockerImage: Image) =>
  dockerImage.repoDigest.apply(digest =>
    interpolate`#!/bin/bash
echo "ec2-user:${serialConsolePassword.apply(pw => pw)}" | chpasswd
echo "Instance starting. Docker digest ${digest}" >> /var/log/messages
aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${ecrRepository.repository.repositoryUrl.apply(
      url => url.split('/')[0]
    )}
echo "ECR Logged In. Docker digest ${digest}" >> /var/log/messages
docker pull ${dockerImage.imageName}
echo "ECR Image Pulled. Docker digest ${digest}" >> /var/log/messages
docker run -d --restart unless-stopped \\
${Object.entries({ ...appArgs, DOCKER_DIGEST: digest })
  .map(([key, value]) => ` -e ${key}="${value}" \\`)
  .join('\n')}
 -p ${hostConfig.TUNNEL_FORWARD_PORT}:${hostConfig.TUNNEL_FORWARD_PORT} \\
 ${dockerImage.imageName}
echo "Docker Container On Port ${hostConfig.TUNNEL_FORWARD_PORT}. Docker digest ${digest}" >> /var/log/messages
systemctl start amazon-cloudwatch-agent
`.apply(data => Buffer.from(data).toString('base64'))
  );

export const createLaunchTemplate = (dockerImage: Image) =>
  new ec2.LaunchTemplate('sai-template', {
    namePrefix: 'sai-demo-',
    imageId: hostConfig.awsAmiId,
    instanceType: 't3.medium',
    updateDefaultVersion: true,
    iamInstanceProfile: {
      name: ec2InstanceProfile.name,
    },
    networkInterfaces: [
      {
        associatePublicIpAddress: 'true',
        subnetId: physicalZoneSubnetId,
        securityGroups: [egressOnlySgId],
      },
    ],
    placement: {
      availabilityZone: hostConfig.physicalSubzone,
    },
    tags: {
      // This ensures redeployment.
      dockerImageTag: dockerImage.repoDigest || 'Unknown',
    },
    userData: getUserData(dockerImage),
  });
