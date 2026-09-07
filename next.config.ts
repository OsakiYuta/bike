import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/bike',
  trailingSlash: true,
};

export default nextConfig;
