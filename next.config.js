/** @type {import('next').NextConfig} */
const path = require("path");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  images: {
    domains: ["i.scdn.co", "mosaic.scdn.co"],
  },
  webpack: (config) => {
    config.module.rules.push({
      resolve: {
        alias: {
          three$: path.resolve("./build/three-exports.js"),
        },
      },
    });
    return config;
  }
});
