/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  experimental: { 
    serverActions: { bodySizeLimit: '2mb' },
  },
  // Fix chunk loading issues
  webpack: (config, { isServer, dev }) => {
    // Add alias for SDK package
    config.resolve.alias['@/sdk'] = path.resolve(__dirname, '../../packages/sdk');
    
    // Ensure webpack can resolve modules from both web and sdk node_modules
    config.resolve.modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../packages/sdk/node_modules'),
    ];

    // Fix chunk loading timeout issues
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }

    // Increase timeout for chunk loading
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
      },
    };
    
    return config;
  },
  // Add performance optimizations
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Increase timeout for static generation
  staticPageGenerationTimeout: 1000,
};

module.exports = nextConfig;

