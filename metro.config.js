const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent Metro from trying to symbolicate anonymous frames
config.symbolicator = {
  ...config.symbolicator,
  customizeFrame: (frame) => {
    if (frame.file && frame.file.includes('<anonymous>')) {
      return null; // Skip anonymous frames
    }
    return frame;
  },
};

// Add a block list to prevent Metro from trying to resolve anonymous paths
config.resolver.blockList = [
  // This regex matches the anonymous path mentioned in the error
  /\/home\/project\/<anonymous>/,
];

module.exports = config;