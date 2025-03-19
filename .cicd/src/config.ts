import { config, getCallerIdentity } from "@pulumi/aws";
import { DefaultVpc } from "@pulumi/awsx/ec2";
import { Config, getProject, getStack } from "@pulumi/pulumi";

const pulumiConfig = new Config();

export const pulumiProject = getProject();
export const pulumiStack = getStack();
export const awsAccountId = getCallerIdentity().then((id) => id.accountId);
export const logGroupName = pulumiConfig.require("logGroupName");
export const region = config.region;
export const vpc = new DefaultVpc("default-vpc", {}, { retainOnDelete: true });

export const cloudflareConfig = pulumiConfig.requireObject<{
  tld: string;
  accountId: string;
  subdomain: string;
  cidrMask: string;
}>("cloudflare");

export const hostConfig = pulumiConfig.requireObject<{
  tunnelTarget: string;
  awsAmiId: string;
  physicalSubzone: string;
  CONTAINER_PORT: string;
}>("hostConfig");

export const buildArgs = pulumiConfig.requireObject<{
  CONTAINER_PORT: string;
}>("buildArgs");

export const appArgs = pulumiConfig.requireObject<{
  APPLICATION_PORT: number;
}>("appArgs");
