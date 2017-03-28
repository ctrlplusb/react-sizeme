import webpackConfigFactory from './configFactory'

module.exports = function umdMinConfigFactory(options, args = {}) {
  return webpackConfigFactory({ target: 'umd-min' }, args)
}
