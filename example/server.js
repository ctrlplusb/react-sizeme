import path from 'path';
import express from 'express';
import webpack from 'webpack';
import config from './webpack.config.babel';

const server = express();
const compiler = webpack(config);

server.use(require(`webpack-dev-middleware`)(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

server.use(require(`webpack-hot-middleware`)(compiler));

server.get(`*`, (req, res) => {
  res.sendFile(path.resolve(__dirname, `./public/index.html`));
});

server.listen(3002, `localhost`, (err) => {
  if (err) {
    console.log(err); // eslint-disable-line no-console
    return;
  }

  console.log(`Listening at http://localhost:3002`); // eslint-disable-line no-console
});
