const fetch = require('node-fetch')

const credentials = require('./credentials.json')

let current_req = null
const insee_api_root = 'https://api.insee.fr'
const waiter = (ms) => new Promise(ok => setTimeout(ok, ms))
async function insee_api(system, endpoint, ep_args) {
    if (current_req) {
        await current_req
        await (waiter(500))
    }
    const url_elms = [insee_api_root, system, endpoint, ep_args]
    const url = url_elms.join('/').replace(/\/\//g, '/')
    const options = { method: 'GET', headers: { Authorization: 'Bearer ' + credentials.token } }
    console.log('calling insee api', url, options)
    current_req = fetch(url, options)
    const resp = await current_req
    console.log(resp)
    if (resp.statusCode == 404) throw resp
    const json = await resp.json()
    return json
}

function insee_siret(siret) {
    return insee_api('entreprises/sirene/V3', 'siret', siret)
}

function insee_siren(sirene) {
    return insee_api('entreprises/sirene/V3', 'siren', sirene)
}

function insee_naf(naf) {
    return insee_api('metadonnees/V1/codes', 'nafr2/sousClasse', naf)
}

async function exec_func(res, func) {
    try {
        await func()
    } catch (e) {
        res.status(e.status).send(await e.text())
    }
}

module.exports = (app) => {

    app.get('/api/siret/:siret', async (req, res) => {
        exec_func(res, async () => {
            const { siret } = req.params
            res.json(await insee_siret(siret))
        })
    })

    app.get('/api/siren/:siren', async (req, res) => {
        exec_func(res, async () => {
            const { siren } = req.params
            res.json(await insee_siren(siren))
        })
    })

    app.get('/api/naf/:naf', async (req, res) => {
        exec_func(res, async () => {
            const { naf } = req.params
            res.json(await insee_naf(naf))
        })
    })

}