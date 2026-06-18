module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { firefox: '109' },
      modules: false
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ]
};
