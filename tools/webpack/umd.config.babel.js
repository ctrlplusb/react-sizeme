import webpackConfigFactory from './configFactory'

module.exports = function umdConfigFactory(options, args = {}) {
  return webpackConfigFactory({ target: 'umd' }, args)
}
