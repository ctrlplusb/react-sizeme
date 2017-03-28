import express from 'express'
import path from 'path'

const port = process.env.PORT || 1337
const app = express()

app.use(express.static(path.resolve('./build')))

app.listen(port, () => console.log(`Example running on port ${port}...`))
