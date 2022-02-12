import Vue from 'vue'

class API {

    constructor() {
        this.stored_naf = {}
    }

    // ------------------------- MAIN CALLER

    async __api(endpoint, data) {
        const url = ['', 'api', endpoint, data].join('/')
        const options = { method: 'GET' }
        const resp = await fetch(url, options)
        return await resp.json()
    }

    // ------------------------- APIS

    siren(siren) {
        return this.__api('siren', siren)
    }

    siret(siret) {
        return this.__api('siret', siret)
    }

    async naf(naf) {
        if (naf in this.stored_naf) return this.stored_naf[naf]
        const nafd = await this.__api('naf', naf)
        this.stored_naf[naf] = nafd
        return nafd
    }

    // ------------------------- Vue Install

    install(vue) {
        const me = this
        vue.mixin({
            beforeCreate() {
                this.$api = me
            },
        })
    }

}

const api = new API()
Vue.use(api)
