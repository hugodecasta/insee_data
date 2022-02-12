<template>
    <v-app>
        <div class='ma-3'>

            <v-text-field
                v-model="code"
                label="sirene/siret"
            ></v-text-field>

            <v-btn
                color='primary'
                @click="check"
                :loading="loading"
                :disabled="loading"
            >
                check
            </v-btn>

            <template v-if="data">
                <h1>{{data.type}} - {{data.code}}</h1>

                <!-- ------------------------------------------------------------- SIREN -->
                <template v-if="data.type == 'siren'">

                    <h2>Propriétaire</h2>
                    {{data.insee_data.uniteLegale.prenom1UniteLegale}}
                    {{data.insee_data.uniteLegale.periodesUniteLegale[0].nomUniteLegale}}

                    <h2>Periodes</h2>
                    <table>
                        <div
                            v-for="period in data.insee_data.uniteLegale.periodesUniteLegale"
                            :key="period.dateDebut"
                        >
                            <tr
                                v-for="(prop,name) in ul_period_display_map"
                                :key="name"
                            >
                                <td>{{name}}</td>
                                <td>{{parse_value(prop,period[prop])}}</td>
                            </tr>
                            <tr>
                                <td>NAF</td>
                                <td>{{period.activitePrincipaleUniteLegale}}
                                    ({{get_naf(period.activitePrincipaleUniteLegale)}})</td>
                            </tr>
                            <tr>
                                <td>ACTION</td>
                                <td>{{parse_value('action',action_period(period))}}</td>
                            </tr>
                            <v-divider></v-divider>
                        </div>
                    </table>

                </template>

                <!-- ------------------------------------------------------------- SIRET -->
                <template v-else-if="data.type == 'siret'">

                    <h2>Propriétaire</h2>
                    {{data.insee_data.etablissement.uniteLegale.prenom1UniteLegale}}
                    {{data.insee_data.etablissement.uniteLegale.nomUniteLegale}}

                    <h2>Code établissement</h2>
                    {{data.insee_data.etablissement.nic}}

                    <h2>Adresse</h2>
                    <table>
                        <tr
                            v-for="(prop,name) in adresse_display_map"
                            :key="name"
                        >
                            <td>{{name}}</td>
                            <td>{{data.insee_data.etablissement.adresseEtablissement[prop]}}</td>
                        </tr>
                    </table>

                    <h2>Periodes</h2>
                    <table>
                        <div
                            v-for="period in data.insee_data.etablissement.periodesEtablissement"
                            :key="period.dateDebut"
                        >
                            <tr
                                v-for="(prop,name) in eta_period_display_map"
                                :key="name"
                            >
                                <td>{{name}}</td>
                                <td>{{period[prop]}}</td>
                            </tr>
                            <tr>
                                <td>NAF</td>
                                <td>{{period.activitePrincipaleEtablissement}}
                                    ({{get_naf(period.activitePrincipaleEtablissement)}})</td>
                            </tr>
                            <tr>
                                <td>ACTION</td>
                                <td>{{parse_value('action',action_period(period))}}</td>
                            </tr>
                            <v-divider></v-divider>
                        </div>
                    </table>

                </template>

            </template>
            <template v-else-if="error">
                <v-card
                    class='ma-5'
                    color="error"
                    dark
                >
                    <v-card-title v-html="error"></v-card-title>
                </v-card>
            </template>

        </div>
    </v-app>
</template>

<script>

export default {
    name: 'Insee_DATA',
    data: () => ({
        code: '',
        error: null,
        data: null,

        loading: false,

        adresse_display_map: {
            'numero': 'numeroVoieEtablissement',
            'type voie': 'typeVoieEtablissement',
            'voie': 'libelleVoieEtablissement',
            'commune': 'libelleCommuneEtablissement',
            'code postal': 'codePostalEtablissement',
        },

        eta_period_display_map: {
            'fin': 'dateFin',
            'début': 'dateDebut',
        },

        ul_period_display_map: {
            'nom propriétaire': 'nomUniteLegale',
            'siege': 'nicSiegeUniteLegale',
            'fin': 'dateFin',
            'début': 'dateDebut',
        },

        nafs: {

        }
    }),
    methods: {
        get_naf(naf) {
            if (!this.nafs[naf]) {
                this.$set(this.nafs, naf, 'loading ...')
                this.$api.naf(naf).then(nafd => this.$set(this.nafs, naf, nafd.intitule))
            }
            return this.nafs[naf]
        },
        async check() {
            this.error = null
            this.data = null

            const code = this.code.replace(/\s/g, '')
            const type = code.length == 9 ? 'siren' : code.length == 14 ? 'siret' : null
            if (!type) return this.error = `incorrect code "${code}"`

            this.loading = true
            try {
                const insee_data = await this.$api[type](code)
                if (insee_data.header.statut != 200) this.error = insee_data.header.message
                else this.$set(this, 'data', { type, code, insee_data })

            } catch (e) {
                this.error = e.stack.replace(/\n/g, '<br/>')
            }
            this.loading = false
        },
        action_period(period) {
            return Object.keys(period).find(k => period[k] === true)
        },
        parse_value(prop, value) {
            return ({
                'dateFin': () => value ? value : 'en cours ...',
                'action': () => value ? value : "pas d'action",
            }[prop] ?? (() => value))()
        }
    },
    mounted() {
    }
};
</script>

<style>
html {
}
td:last-child {
    padding-left: 20px;
}
h2 {
    margin-top: 30px;
}
</style>
