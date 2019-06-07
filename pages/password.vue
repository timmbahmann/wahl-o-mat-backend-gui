<template>
  <div>
    <v-snackbar v-model="success" :top="true" color="green">
      Passwort erfolgreich geändert
    </v-snackbar>
    <v-form ref="form" v-model="valid">
      <v-layout>
        <v-flex s12 m6 offset-m3>
          <v-card>
            <v-container fluid>
              <v-layout row wrap>
                <v-flex xs12>
                  <h2 class="mb-2">
                    Einstellungen
                  </h2>
                </v-flex>
                <v-flex xs12>
                  <h3>
                    E-Mail Adresse
                  </h3>
                  <p>
                    {{ $store.state.authUser.user }}
                  </p>
                </v-flex>
                <v-flex xs12>
                  <h3>
                    Passwort ändern
                  </h3>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model="oldpw"
                    :append-icon="show1 ? 'visibility' : 'visibility_off'"
                    :rules="[rules.required]"
                    :type="show1 ? 'text' : 'password'"
                    name="oldpw"
                    counter
                    label="altes Passwort"
                    @click:append="show1 = !show1"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model="newpw"
                    :append-icon="show2 ? 'visibility' : 'visibility_off'"
                    :rules="[rules.required, rules.min]"
                    :type="show2 ? 'text' : 'password'"
                    name="newpw"
                    counter
                    label="neues Passwort"
                    @click:append="show2 = !show2"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model="newpw2"
                    :append-icon="show3 ? 'visibility' : 'visibility_off'"
                    :rules="[rules.required, rules.min, rules.same]"
                    :type="show3 ? 'text' : 'password'"
                    name="newpw"
                    counter
                    label="neues Passwort wiederholen"
                    @click:append="show3 = !show3"
                  ></v-text-field>
                </v-flex>
                <v-flex>
                  <v-btn color="green" :disabled="!valid" @click="changePW">
                    Passwort ändern
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-dialog v-model="dialog" width="500">
                    <template v-slot:activator="{ on }">
                      <v-btn color="red" dark v-on="on">
                        Nutzerkonto löschen
                      </v-btn>
                    </template>

                    <v-card>
                      <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                      >
                        Nutzerkonto löschen
                      </v-card-title>

                      <v-card-text>
                        <p v-if="userError !== ''">
                          {{ userError }}
                        </p>
                        Bist du dir wirklich sicher?
                      </v-card-text>

                      <v-divider></v-divider>

                      <v-card-actions>
                        <v-btn color="green" flat @click="dialog = false">
                          Abbrechen
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="error" flat @click="deleteUser">
                          Löschen
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-form>
  </div>
</template>

<script>
import axios from 'axios'
// import consola from 'consola'

export default {
  layout: 'default',
  data() {
    return {
      rules: {
        required: value => !!value || 'Benötigt.',
        min: v => v.length >= 8 || 'Mindestens 8 Zeichen',
        same: v => v === this.newpw || 'Passwörter nicht identisch'
      },
      oldpw: '',
      newpw2: '',
      newpw: '',
      userError: '',
      dialog: false,
      show1: false,
      show2: false,
      show3: false,
      valid: false,
      valid2: false,
      success: false
    }
  },
  methods: {
    changePW() {
      axios
        .put('/api/password', {
          oldpw: this.oldpw,
          newpw: this.newpw
        })
        .then(response => {
          this.success = response.data.success
          this.oldpw = ''
          this.newpw = ''
          this.newpw2 = ''
          this.$refs.form.resetValidation()
        })
    },
    deleteUser() {
      axios.delete('/api/user').then(response => {
        this.$router.push('/login')
      })
    }
  }
}
</script>
