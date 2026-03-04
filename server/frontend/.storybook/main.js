const path = require('path');

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: [
    '../components/**/*.mdx',
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  staticDirs: [
    { from: '../components', to: '/static/components' },
    { from: '../assets', to: '/static/assets' },
    { from: '../pages', to: '/static/pages' },
  ],
  framework: '@storybook/html-vite',
  async viteFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Map '/static' (FastAPI static prefix) → frontend root so that
      // JS imports like '/static/components/button/button.js' resolve correctly.
      '/static': path.resolve(__dirname, '..'),
    };
    return config;
  },
};

module.exports = config;