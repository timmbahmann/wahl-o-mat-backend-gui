import axios from 'axios'
import consola from 'consola'

export const state = () => ({
  authUser: null
})

export const mutations = {
  SET_USER: function(state, user) {
    state.authUser = user
  }
}

export const actions = {
  // nuxtServerInit is called by Nuxt.js before server-rendering every page
  async nuxtServerInit({ commit }, { req }) {
    if (req.headers.cookie !== undefined) {
      await axios
        .get('http://localhost:3001/user/me', {
          headers: {
            Cookie: req.headers.cookie
          }
        })
        .then(response => {
          const data = {
            user: response.data.username,
            role: response.data.role
          }
          commit('SET_USER', data)
        })
        .catch(error => {
          consola.error(error)
        })
    }
    if (req.session && req.session.authUser) {
      commit('SET_USER', req.session.authUser)
    }
  },
  async login({ commit }, { username, password }) {
    try {
      const { data } = await axios.post('/api/login', { username, password })
      consola.log('data', data)
      commit('SET_USER', data)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error('Bad credentials')
      }
      throw error
    }
  },

  async logout({ commit }) {
    await axios.post('/api/logout')
    commit('SET_USER', null)
  }
}
