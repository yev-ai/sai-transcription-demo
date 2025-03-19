import { lb } from '@pulumi/aws';
import { vpc } from './config';

export const targetGroup = new lb.TargetGroup('sai-target-group', {
  port: 3000,
  protocol: 'HTTP',
  targetType: 'instance',
  vpcId: vpc.vpcId,
  healthCheck: {
    enabled: true,
    path: '/api/healthcheck',
    port: '3000',
    protocol: 'HTTP',
    healthyThreshold: 2,
    unhealthyThreshold: 2,
    timeout: 5,
    interval: 10,
    matcher: '200',
  },
});
