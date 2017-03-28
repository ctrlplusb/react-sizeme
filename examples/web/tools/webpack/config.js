import { resolve as resolvePath } from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import appRootDir from 'app-root-dir';
import pkg from '../../package.json';

module.exports = {
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
    new webpack.NoErrorsPlugin(),
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
        include: [
          resolvePath(appRootDir.get(), './src'),
        ],
      },
    ],
  },
};
