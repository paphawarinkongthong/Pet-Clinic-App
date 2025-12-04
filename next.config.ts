import type { NextConfig } from "next";

//const nextConfig: NextConfig = {
  /* config options here */
//};

//export default nextConfig;

const nextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    serverSourceMaps: false,
  },
}

module.exports = nextConfig
