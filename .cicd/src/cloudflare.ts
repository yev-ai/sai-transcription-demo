import { getZone, Record, ZeroTrustTunnelCloudflared, ZeroTrustTunnelCloudflaredConfig, ZeroTrustTunnelRoute } from '@pulumi/cloudflare';
import type { ZeroTrustTunnelCloudflaredConfigConfig as CloudflareTunnelConfig } from '@pulumi/cloudflare/types/input';
import { Output } from '@pulumi/pulumi';
import { cloudflareConfig, hostConfig } from './config';
import { createPassword } from './password';

const { tld, accountId, subdomain } = cloudflareConfig;
const { cidrMask } = cloudflareConfig;

const cloudflareRootZone = getZone({ name: tld });
const cloudflareRootZoneId = cloudflareRootZone.then(zone => zone.zoneId);

export const createAnycastTunnelTarget = (resourcePrefix: string, subdomain: string, cname: Output<string>) =>
  new Record(`${resourcePrefix}-dns-cname`, {
    zoneId: cloudflareRootZoneId,
    name: subdomain,
    type: 'CNAME',
    content: cname,
    proxied: true,
  });

export const createSaiAnycastTunnelTarget = (tunnel: ZeroTrustTunnelCloudflared) =>
  createAnycastTunnelTarget('sai', subdomain, tunnel.cname);

export const createTunnelWithRoute = (resourcePrefix: string, config: CloudflareTunnelConfig) => {
  const pass = createPassword(`${resourcePrefix}-twr-pass`);

  const tunnel = new ZeroTrustTunnelCloudflared(`${resourcePrefix}-twr-tunnel`, {
    name: `${resourcePrefix}-tunnel`,
    accountId: accountId,
    secret: pass.apply(pwd => Buffer.from(pwd).toString('base64')),
  });

  const tunnelConfig = new ZeroTrustTunnelCloudflaredConfig(`${resourcePrefix}-twr-config`, {
    tunnelId: tunnel.id,
    accountId: accountId,
    config: {
      warpRouting: { enabled: true },
      ...config,
    },
  });

  const tunnelRoute = new ZeroTrustTunnelRoute(`${resourcePrefix}-twr-route`, {
    accountId: accountId,
    tunnelId: tunnel.id,
    network: cidrMask,
  });

  return {
    tunnel,
    tunnelConfig,
    tunnelRoute,
  };
};

export const createSaiTunnelWithRoute = () =>
  createTunnelWithRoute('sai-2', {
    warpRouting: { enabled: true },
    ingressRules: [
      {
        hostname: `${subdomain}.${tld}`,
        service: hostConfig.tunnelTarget,
        originRequest: {
          noTlsVerify: true,
          http2Origin: true,
          noHappyEyeballs: true,
        },
      },
      { service: 'http_status:404' },
    ],
  });
