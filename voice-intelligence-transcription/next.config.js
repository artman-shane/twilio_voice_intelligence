const path = require('path');

module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3|flac|wav)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'uploads/',
          publicPath: '/uploads/',
        },
      },
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ];
  },
};