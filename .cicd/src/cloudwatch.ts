import { cloudwatch } from "@pulumi/aws";
import { logGroupName } from "./config";

export const createLogGroup = () =>
  new cloudwatch.LogGroup("sai-log-group", {
    name: logGroupName,
    retentionInDays: 30,
  });
