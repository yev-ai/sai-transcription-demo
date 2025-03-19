import { config, getCallerIdentity } from '@pulumi/aws';
import { DefaultVpc } from '@pulumi/awsx/ec2';
import { Config, getProject, getStack } from '@pulumi/pulumi';

export const vpc = new DefaultVpc('default-vpc', {}, { retainOnDelete: true });
const pulumiConfig = new Config();

export const awsAccountId = getCallerIdentity().then(id => id.accountId);
export const pulumiProject = getProject();
export const pulumiStack = getStack();
export const region = config.region;

// This lays out the ESC config topology if you'd like to self-deploy.
// An AMI with cloudflared + nginx + tailscale is required for mesh.
// This assumes that SSL/TLS termination is handled by the host.

export const cloudflareConfig = pulumiConfig.requireObject<{
  tld: string;
  accountId: string;
  subdomain: string;
  cidrMask: string;
}>('cloudflare');

export const hostConfig = pulumiConfig.requireObject<{
  tunnelTarget: string;
  awsAmiId: string;
  physicalSubzone: string;
  logGroupName: string;
  TUNNEL_FORWARD_PORT: string;
}>('hostConfig');

export const buildArgs = pulumiConfig.requireObject<{
  CONTAINER_PORT: string;
}>('buildArgs');

export const appArgs = pulumiConfig.requireObject<{
  PORT: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  NODE_ENV: string;
}>('appArgs');
