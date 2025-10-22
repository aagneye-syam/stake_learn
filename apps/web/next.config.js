/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  experimental: { 
    serverActions: { bodySizeLimit: '2mb' },
  },
  webpack: (config, { isServer }) => {
    // Add alias for SDK package
    config.resolve.alias['@/sdk'] = path.resolve(__dirname, '../../packages/sdk');
    
    // Ensure webpack can resolve modules from both web and sdk node_modules
    config.resolve.modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../packages/sdk/node_modules'),
    ];
    
    return config;
  },
};

module.exports = nextConfig;

