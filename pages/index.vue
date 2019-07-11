<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline"
          >Willkommen beim Wahl-o-Maten</v-card-title
        >
        <v-card-text>
          <p>
            Einloggen funktioniert
            <router-link to="/login"><a>hier</a></router-link>
          </p>
          <p>
            Auf der linken Seite befindet sich die Navigation. Neue Wahlen
            lassen sich mit dem '+'-Symbol hinzufügen und vorhandene Wahlen mit
            einem Klick auf den Wahlnamen bearbeiten.
          </p>
          <p>
            Nutzer lassen sich mit einem Klick auf Nutzerverwaltung verwalten.
          </p>
          <p>
            Mit einem Klick auf den Benutzernamen oben lässt sich bei
            Einstellungen das Passwort ändern oder das Konto löschen. Ausserdem
            kann man sich mit einem Klick auf Abmelden ausloggen.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" flat nuxt to="/login">Einloggen</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from 'axios'

export default {
  head() {
    return {
      title: 'Index Page'
    }
  },
  data() {
    return {
      users: null
    }
  },
  middleware: 'auth',
  methods: {
    getUser() {
      axios.get('/api/user').then(u => {
        this.users = u.data
      })
    }
  }
}
</script>
