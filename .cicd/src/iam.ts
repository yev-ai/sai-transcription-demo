import { iam } from '@pulumi/aws';

const ec2Role = new iam.Role('sai-ec2-role', {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'ec2.amazonaws.com' },
        Action: 'sts:AssumeRole',
      },
    ],
  }),
});

const cloudwatchPolicyAttachment = new iam.RolePolicyAttachment('sai-ec2-logs', {
  role: ec2Role.name,
  policyArn: iam.ManagedPolicy.CloudWatchAgentServerPolicy,
});

const ecrPolicyAttachment = new iam.RolePolicyAttachment('sai-ec2-ecr', {
  role: ec2Role.name,
  policyArn: iam.ManagedPolicy.AmazonEC2ContainerRegistryReadOnly,
});

export const ec2InstanceProfile = new iam.InstanceProfile(
  'sai-ec2-profile',
  {
    role: ec2Role.name,
  },
  { dependsOn: [cloudwatchPolicyAttachment, ecrPolicyAttachment] }
);
