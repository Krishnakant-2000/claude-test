// Webpack optimization configuration
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: (config, env) => {
    // Production optimizations
    if (env === 'production') {
      // Enable compression
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8,
        })
      );

      // Bundle analyzer (only when needed)
      if (process.env.ANALYZE_BUNDLE === 'true') {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html',
          })
        );
      }

      // Optimize chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
            },
            // Firebase chunk
            firebase: {
              test: /[\\/]node_modules[\\/]firebase[\\/]/,
              name: 'firebase',
              chunks: 'all',
              priority: 30,
            },
            // React chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 40,
            },
            // Common chunks
            common: {
              minChunks: 2,
              name: 'common',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };

      // Tree shaking optimization
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@constants': path.resolve(__dirname, 'src/constants'),
        '@assets': path.resolve(__dirname, 'src/assets'),
      };
    }

    return config;
  },
};