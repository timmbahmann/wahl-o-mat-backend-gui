<template>
  <div class="text-xs-center">
    <v-dialog v-model="dialog" width="500">
      <template v-slot:activator="{ on }">
        <v-btn icon color="warning" flat v-on="on">
          <v-icon>refresh</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          Passwort zurücksetzen
        </v-card-title>

        <v-card-text>
          {{ dialogText }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="error" :disabled="sent" flat @click="dialog = false">
            Abbrechen
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="green" :disabled="sent" flat @click="resetPW">
            Bestätigen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import consola from 'consola'
import axios from 'axios'

export default Vue.extend({
  data() {
    return {
      dialog: false,
      dialogText: '',
      sent: false
    }
  },
  mounted() {
    this.dialogText = `Beim klicken auf 'Bestätigen' wird ein neues Passwort generiert und an die Adresse '${
      this.params.node.data.email
    }' gesendet.`
  },
  methods: {
    resetPW() {
      this.sent = true
      axios
        .put('/api/user/password', {
          username: this.params.node.data.email
        })
        .then(u => {
          consola.log(u)
          this.dialogText = 'Die Mail wurde erfolgreich vesendet'
          setTimeout(() => {
            this.dialog = false
            this.sent = false
            this.dialogText = `Beim klicken auf 'Bestätigen' wird ein neues Passwort generiert und an die Adresse '${
              this.params.node.data.email
            }' gesendet.`
          }, 1500)
        })
        .catch(error => {
          this.dialogText = error
          this.sent = false
        })
    }
  }
})
</script>
