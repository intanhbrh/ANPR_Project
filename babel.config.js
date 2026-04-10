module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      // This line is the fix for the 'flow' syntax error
      '@babel/preset-flow', 
    ],
  };
};