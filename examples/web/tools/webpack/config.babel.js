import { resolve as resolvePath } from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import appRootDir from 'app-root-dir'
import pkg from '../../package.json'

const config = {
  entry: {
    index: resolvePath(appRootDir.get(), './src/index.js'),
  },
  output: {
    path: resolvePath(appRootDir.get(), './build'),
    filename: `${pkg.name}.js`,
    publicPath: '/',
  },
  target: 'web',
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development',
      ),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolvePath(__dirname, './html.js'),
      inject: true,
      // We can pass custom data to the template...
      custom: {
        name: pkg.name,
        description: pkg.description,
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolvePath(appRootDir.get(), './src')],
      },
    ],
  },
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        screw_ie8: true,
        warnings: false,
      },
      mangle: {
        screw_ie8: true,
      },
      output: {
        comments: false,
        screw_ie8: true,
      },
    }),
  )
}

module.exports = config
