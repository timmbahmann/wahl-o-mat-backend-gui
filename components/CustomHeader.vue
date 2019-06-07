<template>
  <div>
    <div class="customHeaderLabel">
      {{ params.displayName }}
      <v-btn ref="btn" small flat icon @click.prevent="sendDeleteMessage">
        <v-icon>delete</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import consola from 'consola'
// import axios from 'axios'

export default Vue.extend({
  data() {
    return {
      active: true,
      test: Math.random()
    }
  },
  beforeDestroy() {
    this.active = false
  },
  mounted() {
    consola.log(this.params)
  },
  methods: {
    sendDeleteMessage() {
      if (this.active) {
        const event = 'deleteCol'
        consola.log('sented ' + event, this.test)
        const data = {
          displayName: this.params.displayName,
          rand: this.test
        }
        this.$bus.$emit(event, data)
      } else {
        consola.log('DO NOT sent deleteCol')
      }
    }
  }
})
</script>
