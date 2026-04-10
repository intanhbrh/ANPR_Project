const { getDefaultConfig } = require('expo/metro-config'); // Or 'metro-config' for bare React Native

// Check if you are using an Expo managed workflow or bare React Native
// If you used 'npx create-react-native-app', use the line below:
// const { getDefaultConfig } = require('@react-native/metro-config');

// If you used Expo, use the first line above.
// Assuming bare React Native for widest compatibility:

const config = getDefaultConfig(__dirname);

// You can add custom configurations here if needed, 
// but for now, the default should be fine.

module.exports = config;