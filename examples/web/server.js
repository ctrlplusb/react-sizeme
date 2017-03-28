import express from 'express'
import webpack from 'webpack'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import config from './tools/webpack/config'

const port = process.env.PORT || 1337
const app = express()
const compiler = webpack(config)
app.use(
  devMiddleware(compiler, {
    quiet: true,
    noInfo: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // Ensure that the public path is taken from the compiler webpack config
    // as it will have been created as an absolute path to avoid conflicts
    // with an node servers.
    publicPath: compiler.options.output.publicPath,
  }),
)
app.use(hotMiddleware(compiler))

app.listen(port, () => console.log(`Example running on port ${port}...`))
