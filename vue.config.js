const server = require('./server')

module.exports = {

    devServer: {
        port: process.env.PORT ?? 3000,
        before: server
    },

    transpileDependencies: [
        'vuetify'
    ]
}
