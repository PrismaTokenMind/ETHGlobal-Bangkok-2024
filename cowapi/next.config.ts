/** @type {import('next').NextConfig} */
const nextConfig = {
  // serverExternalPackages: ['rust_verifier'],
    webpack: (config:any, { isServer }:any) => {
    if (isServer) {
      config.module.rules.push({
        test: /\.node$/,
        use: [
          {
            loader: 'nextjs-node-loader',
            options: {
              outputPath: config.output.path,
            },
          },
        ],
      });
    }
    return config;
  },
};

module.exports = nextConfig;