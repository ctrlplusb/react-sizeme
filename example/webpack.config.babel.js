import webpack from 'webpack';
import path from 'path';

const config = {
  entry: [
    path.resolve(__dirname, `./src/index.js`)
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [`babel-loader`],
        include: [
          path.resolve(__dirname, `./src`),
          path.resolve(__dirname, `../src`)
        ],
        exclude: /node_modules/
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, `./lib`),
    filename: `sizeme-example.js`
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || `development`)
    })
  ]
};

if (process.env.NODE_ENV === `development`) {
  config.entry.push(`webpack-hot-middleware/client`);
  config.output.publicPath = `/assets/`;
}

if (process.env.NODE_ENV === `production`) {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
        warnings: false
      }
    })
  );
}

export default config;
