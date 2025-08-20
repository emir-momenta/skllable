const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add a block list to prevent Metro from trying to resolve anonymous paths
config.resolver.blockList = [
  // This regex matches the anonymous path mentioned in the error
  /\/home\/project\/<anonymous>/,
];

module.exports = config;