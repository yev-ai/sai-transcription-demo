import { secret } from '@pulumi/pulumi';
import { createAsg } from './src/autoscaling';
import { createSaiAnycastTunnelTarget, createSaiTunnelWithRoute } from './src/cloudflare';
import { createLogGroup } from './src/cloudwatch';
import { createDockerImage } from './src/docker';
import { createLaunchTemplate, serialConsolePassword } from './src/ec2';
import { ecrRepository } from './src/ecr';

const logGroup = createLogGroup();

const twr = createSaiTunnelWithRoute();
const dnsRecord = createSaiAnycastTunnelTarget(twr.tunnel);

const dockerImage = createDockerImage('sai-image', ecrRepository);
const launchTemplate = createLaunchTemplate(dockerImage);
const asg = createAsg(launchTemplate, dockerImage);

// Reminder: this is a public repository.
export const dockerDigest = dockerImage.repoDigest;
export const consolePassword = secret(serialConsolePassword);
