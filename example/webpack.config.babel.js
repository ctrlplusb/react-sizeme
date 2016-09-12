import webpack from 'webpack';
import path from 'path';

const config = {
  entry: [
    'webpack-hot-middleware/client',
    path.resolve(__dirname, './src/index.js'),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        include: [
          path.resolve(__dirname, './src'),
          path.resolve(__dirname, '../src'),
        ],
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, './lib'),
    filename: 'sizeme-example.js',
    publicPath: '/assets/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
};

export default config;
