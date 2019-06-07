<template>
  <v-app light>
    <v-navigation-drawer v-model="drawer" fixed app>
      <v-snackbar v-model="snackbar" :top="true" :color="snackbarColor">
        {{ snackbarMessage }}
      </v-snackbar>
      <v-img src="/logo.jpg">
        <v-layout pa-2 column fill-height class="lightbox white--text">
          <v-spacer></v-spacer>
          <v-flex shrink>
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <v-btn color="white" flat small class="body-1" v-on="on">
                  {{ $store.state.authUser.user }}
                  <v-icon>expand_more</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-tile style="cursor: pointer" router :to="'/password'">
                  <v-list-tile-avatar>
                    <v-icon>settings</v-icon>
                  </v-list-tile-avatar>
                  Einstellungen
                </v-list-tile>
                <v-list-tile style="cursor: pointer" @click="logout">
                  <v-list-tile-avatar>
                    <v-icon>exit_to_app</v-icon>
                  </v-list-tile-avatar>
                  Abmelden
                </v-list-tile>
              </v-list>
            </v-menu>
          </v-flex>
        </v-layout>
      </v-img>
      <v-list>
        <v-list-tile
          v-if="$store.state.authUser.role === 'Admin'"
          :to="'/users'"
        >
          <v-list-tile-action>
            <v-icon>people</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Nutzerverwaltung
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>
        <v-list-group prepend-icon="where_to_vote" value="true">
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-title>Wahlen</v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile
            v-for="(item, i) in contentItems"
            :key="i"
            :to="item.to"
            router
            exact
          >
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.title }}
              </v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon ripple @click.prevent="deleteWahl(i)">
                <v-icon color="grey lighten-1">delete</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile>
            <v-text-field
              v-if="edit"
              v-model="currentEdit"
              type="text"
              name="editor"
              label="neuer Wahlname"
            >
            </v-text-field>
            <v-list-tile-action v-if="edit">
              <v-btn
                :disabled="currentEdit === ''"
                icon
                ripple
                @click.prevent="toLink"
              >
                <v-icon color="green">done</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
          <v-btn v-if="!edit" block flat @click="addItem">
            <v-icon>add</v-icon>
          </v-btn>
          <v-btn v-else block flat @click="removeLastItem">
            <v-icon>backspace</v-icon>
          </v-btn>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="clipped" fixed app>
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-toolbar-title>{{ title }}</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script>
import axios from 'axios'
import consola from 'consola'

export default {
  data() {
    return {
      title: 'Wahl-o-Mat',
      clipped: false,
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'green',
      drawer: false,
      fixed: false,
      dialog: false,
      edit: false,
      currentEdit: '',
      items: [
        {
          title: 'Welcome',
          to: '/'
        },
        {
          title: 'Inspire',
          to: '/inspire'
        }
      ],
      miniVariant: false,
      right: true
    }
  },
  computed: {
    contentItems() {
      return this.items.filter(v => v.title !== '')
    }
  },
  mounted() {
    axios.get('/api/wahl').then(response => {
      consola.log(response.data.names)
      this.items = response.data.names.map(name => {
        return {
          title: name.name,
          to: '/wahl/' + encodeURIComponent(name.name)
        }
      })
    })
  },
  methods: {
    async logout() {
      try {
        this.$router.push('/login')
        await this.$store.dispatch('logout')
      } catch (e) {
        // TODO
      }
    },
    addItem() {
      this.items.push({
        title: '',
        to: ''
      })
      this.edit = true
    },
    toLink() {
      const wahlname = encodeURIComponent(this.currentEdit)
      axios
        .post('/api/wahl/' + wahlname, {
          gremium: 'xxx',
          thesen: [
            {
              these: 'Beispielthese',
              antworten: [
                {
                  name: 'Beispielliste 1',
                  antwort: 'ja'
                },
                {
                  name: 'Beispielliste 2',
                  antwort: 'neutral'
                }
              ]
            }
          ]
        })
        .then(response => {
          consola.log(response.data)
          this.edit = false
          this.items[this.items.length - 1].title = this.currentEdit
          this.items[this.items.length - 1].to = '/wahl/' + wahlname
          this.currentEdit = ''
        })
        .catch(error => {
          this.snackbarMessage = error
          this.snackbarColor = 'red'
          this.snackbar = true
        })
    },
    removeLastItem() {
      this.edit = false
      this.items.splice(this.items.length - 1, 1)
      this.currentEdit = ''
    },
    deleteWahl(i) {
      const wahlname = encodeURIComponent(this.items[i].title)
      axios.delete('/api/wahl/' + wahlname).then(response => {
        this.snackbarMessage = 'Wahl erfolgreich gelöscht'
        this.snackbarColor = 'green'
        this.snackbar = true
        this.items.splice(i, 1)
      })
    }
  }
}
</script>
