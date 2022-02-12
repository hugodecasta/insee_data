const fetch = require('node-fetch')

const credentials = require('./credentials.json')

const insee_api_root = 'https://api.insee.fr/entreprises'
async function insee_api(system, endpoint, ep_args) {
    const url_elms = [insee_api_root, system, endpoint, ep_args]
    const url = url_elms.join('/').replace(/\/\//g, '/')
    const options = { method: 'GET', headers: { Authorization: 'Bearer ' + credentials.token } }
    const resp = await fetch(url, options)
    const json = await resp.json()
    return json
}

function insee_siret(siret) {
    return insee_api('sirene/V3', 'siret', siret)
}

function insee_sirene(sirene) {
    return insee_api('sirene/V3', 'sirene', sirene)
}

module.exports = (app) => {

    app.get('/api/siret/:siret', async (req, res) => {
        const { siret } = req.params
        res.json(await insee_siret(siret))
    })

    app.get('/api/sirene/:sirene', async (req, res) => {
        const { sirene } = req.params
        res.json(await insee_sirene(sirene))
    })

}