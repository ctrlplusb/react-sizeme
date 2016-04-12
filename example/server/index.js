const path = require(`path`);
const express = require(`express`);
const compression = require(`compression`);

const server = express();

server.use(compression());

server.use(
  `/assets`,
  express.static(path.resolve(__dirname, `../lib`)));

server.get(`/`, (req, res) => {
  res.sendFile(path.resolve(__dirname, `../public/index.html`));
});

server.listen(3003, `localhost`, (err) => {
  if (err) {
    console.log(err); // eslint-disable-line no-console
    return;
  }

  console.log(`Listening at http://localhost:3003`); // eslint-disable-line no-console
});
