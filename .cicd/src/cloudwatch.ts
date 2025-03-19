import { cloudwatch } from '@pulumi/aws';
import { hostConfig } from './config';

export const createLogGroup = () =>
  new cloudwatch.LogGroup('sai-log-group', {
    name: hostConfig.logGroupName,
    retentionInDays: 30,
  });
