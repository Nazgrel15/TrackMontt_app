/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  // Prevenir cache durante desarrollo
  generateBuildId: async () => {
    return 'development-build-' + Date.now();
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development'
              ? 'no-store, must-revalidate'
              : 'public, max-age=31536000, immutable'
          },
        ],
      },
    ];
  },
};

export default nextConfig;