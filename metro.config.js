const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const withStorybook = require('@storybook/react-native/metro/withStorybook');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

config.resolver.extraNodeModules = {
  '@': path.resolve(projectRoot),
};

module.exports = withStorybook(config, {
  enabled: true,
  configPath: path.resolve(projectRoot, './.storybook'),
});
