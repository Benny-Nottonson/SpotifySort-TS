/** @type {import('next').NextConfig} */
const path = require("path");
const webpack = require("webpack");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  images: {
    domains: ["i.scdn.co", "mosaic.scdn.co"],
  },
  webpack: (config, {webpack}) => {
    config.module.rules.push({
      resolve: {
        alias: {
          three$: path.resolve("./build/three-exports.js"),
        },
      },
    }),
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^three$/,
        contextRegExp: /three/,
      }),
    )
    return config; 
  }
});
