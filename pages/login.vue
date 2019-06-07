<template>
  <v-form v-model="valid" @submit.prevent="login">
    <v-container>
      <v-layout>
        <v-flex xs12 md4>
          <v-text-field
            v-model="formUsername"
            :rules="emailRules"
            label="E-Mail"
          ></v-text-field>
        </v-flex>

        <v-flex xs12 md4>
          <v-text-field
            v-model="formPassword"
            :append-icon="show ? 'visibility' : 'visibility_off'"
            :rules="[rules.required]"
            :type="show ? 'text' : 'password'"
            name="input-10-1"
            hint="At least 8 characters"
            counter
            @click:append="show = !show"
          ></v-text-field>
        </v-flex>
        <button v-if="!$store.state.authUser" type="submit" @click="login">
          Login
        </button>
        <button v-else @click.prevent="logout">
          Logout
        </button>
      </v-layout>
      <div v-if="$store.state.authUser">
        <p>Logged in {{ $store.state.authUser }}</p>
      </div>
    </v-container>
  </v-form>
</template>

<script>
export default {
  layout: 'none',
  data() {
    return {
      formError: null,
      formUsername: '',
      formPassword: '',
      show: false,
      valid: false,
      password: 'Password',
      rules: {
        required: value => !!value || 'Required.'
      },
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid'
      ]
    }
  },
  methods: {
    async login() {
      try {
        await this.$store.dispatch('login', {
          username: this.formUsername,
          password: this.formPassword
        })
        this.formUsername = ''
        this.formPassword = ''
        this.formError = null
        this.$router.push('/')
      } catch (e) {
        this.formError = e.message
      }
    },
    async logout() {
      try {
        await this.$store.dispatch('logout')
      } catch (e) {
        this.formError = e.message
      }
    }
  }
}
</script>

<style>
.container {
  padding: 100px;
}
.error {
  color: red;
}
</style>
