import { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: ['./components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-notes',
  ],
};

export default main;
