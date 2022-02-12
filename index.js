// --------------------------------------------------- INIT SERVERS
const express = require('express')
const app = express()

const PORT = process.env.PORT ?? 3000

// --------------------------------------------

const front_end_dir = __dirname + '/dist'

app.use('/', express.static(front_end_dir))
app.get('/', (req, res) => res.sendFile(front_end_dir + '/index.html'))

require('./server')(app)

// --------------------------------------------------- LISTEN

const package = require('./package.json')

app.listen(PORT, () => console.log(`${package.name} v${package.version} listening on ${PORT}`))