// next.config.js
const nextConfig = {
  /* config options here */
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test && rule.test.test(".svg")
    );

    if (fileLoaderRule) {
      // Modify the file loader rule to ignore SVG files
      // so that @svgr/webpack takes over
      fileLoaderRule.exclude = /\.svg$/;
    }

    // Add a new rule to handle SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        and: [/\.(js|ts)x?$/],
      },
      use: ["@svgr/webpack"],
    });

    return config;
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/150/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'nutrapreps.b-cdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.nutrapreps.co.uk',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'nutrapreps.co.uk',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

module.exports = nextConfig;