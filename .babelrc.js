module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    './resources/inline-invariant',
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-transform-classes', { loose: true }],
    ['@babel/plugin-transform-destructuring', { loose: true }],
    ['@babel/plugin-transform-spread', { loose: true }],
    ['@babel/plugin-transform-for-of', { assumeArray: true }],
  ],
  env: {
    cjs: {
      presets: [['@babel/preset-env', { modules: 'commonjs' }]],
    },
    mjs: {
      presets: [['@babel/preset-env', { modules: false }]],
    },
  },
};
