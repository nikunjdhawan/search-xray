/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to enable API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    };

    // Suppress specific React warnings
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /node_modules\/recharts/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                ['@babel/plugin-transform-runtime', { loose: true }],
              ],
            },
          },
        },
      ],
    };

    return config;
  },
};

module.exports = nextConfig;