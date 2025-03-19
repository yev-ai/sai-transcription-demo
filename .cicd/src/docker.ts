import { ecr as legacyEcr } from '@pulumi/aws';
import { ecr } from '@pulumi/awsx';
import { Image } from '@pulumi/docker';
import type { DockerBuild } from '@pulumi/docker/types/input';
import type { Input } from '@pulumi/pulumi';
import { all, interpolate, secret } from '@pulumi/pulumi';
import { buildArgs } from './config';

export const createDockerImage = (pulumiName: string, registry: ecr.Repository) => {
  const authToken = legacyEcr.getAuthorizationTokenOutput({
    registryId: registry.repository.registryId,
  });

  const { username, password } = authToken.authorizationToken.apply(token => {
    const decoded = Buffer.from(token, 'base64').toString();
    const [username, password] = decoded.split(':');
    return { username, password };
  });

  return new Image(pulumiName, {
    build: all([registry.url]).apply(([ecrUrl]) => {
      return {
        args: {
          BUILDKIT_INLINE_CACHE: '1',
          ...buildArgs,
        },
        platform: 'linux/amd64',
        builderVersion: 'BuilderBuildKit',
        cacheFrom: {
          images: [`${ecrUrl}:latest`],
        },
        context: '../',
        dockerfile: 'Dockerfile',
      };
    }) as Input<DockerBuild>,
    imageName: interpolate`${registry.url}:latest`,
    registry: {
      server: registry.url,
      username,
      password: secret(password),
    },
  });
};
