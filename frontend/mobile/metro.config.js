const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable CSS support for Leaflet
config.resolver.sourceExts.push('css');

// Prevent Metro watcher from scanning Android build artifacts
config.resolver.blockList = [
  /.*\/android\/app\/build\/.*/,
  /.*\/android\/\.gradle\/.*/,
];

module.exports = config;

