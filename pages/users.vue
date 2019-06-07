<template>
  <div style="display: flex; flex-direction: row">
    <v-snackbar v-model="success" :top="true" color="green">
      {{ snackbarMessage }}
    </v-snackbar>
    <div style=" overflow: hidden; flex-grow: 1">
      <ag-grid-vue
        style="width: 100%; height: 500px;"
        class="ag-theme-material"
        :column-defs="columnDefs"
        :row-data="rowData"
        :grid-options="gridOptions"
        :default-col-def="defaultColDef"
        :row-drag-managed="true"
        :animate-rows="true"
        :row-selection="rowSelection"
        :suppress-row-click-selection="true"
        @row-drag-end="onRowDragEnd"
        @grid-ready="onGridReady"
        @cell-value-changed="updateCell"
      >
      </ag-grid-vue>
      <v-btn @click="deleteUser">
        Ausgewählte Nutzer entfernen
      </v-btn>
      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on }">
          <v-btn color="green" dark v-on="on">
            Nutzer hinzufügen
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>
            Nutzer hinzufügen
          </v-card-title>

          <v-card-text>
            <p v-if="userError !== ''">
              {{ userError }}
            </p>
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="newUserEMail"
                :rules="emailRules"
                label="E-Mail Adresse"
                required
                full-width
              ></v-text-field>
              <v-select
                :items="['Admin', 'Editor']"
                label="Rolle"
                :value="newUserRole"
                full-width
              ></v-select>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn color="error" flat @click="dialog = false">
              Abbrechen
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="green" :disabled="!valid" flat @click="addUser">
              Nutzer hinzufügen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { AgGridVue } from 'ag-grid-vue'
import consola from 'consola'
import buttonRenderer from '~/components/buttonRenderer.vue'

export default {
  head() {
    return {
      title: 'Nutzerverwaltung'
    }
  },
  components: {
    AgGridVue
  },
  data() {
    return {
      dialog: false,
      valid: false,
      userError: '',
      success: false,
      snackbarMessage: '',
      columnDefs: null,
      rowData: null,
      test: null,
      gridOptions: null,
      gridApi: null,
      columnApi: null,
      rowSelection: null,
      defaultColDef: {
        editable: true,
        resizable: true
      },
      newUserEMail: '',
      newUserRole: 'Editor',
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid'
      ]
    }
  },
  middleware: 'auth',
  beforeMount() {
    this.gridOptions = {}
    this.columnDefs = [
      {
        headerName: 'E-Mail Adresse',
        field: 'email',
        rowDrag: true,
        editable: false,
        headerCheckboxSelection: true,
        checkboxSelection: true
      },
      {
        headerName: 'Rolle',
        field: 'role',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Admin', 'Editor']
        }
      },
      {
        headerName: 'Passwort zurücksetzen',
        editable: false,
        field: 'resetPassword',
        cellRendererFramework: buttonRenderer
      }
    ]
    this.rowSelection = 'multiple'
    axios.get('/api/user').then(u => {
      this.rowData = u.data.map(v => {
        return {
          email: v.username,
          role: v.role,
          resetPassword: true
        }
      })
      this.gridApi.sizeColumnsToFit()
    })
  },
  mounted() {
    this.gridApi = this.gridOptions.api
    this.gridColumnApi = this.gridOptions.columnApi
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
    },
    onRowDragEnd(e) {
      const newData = []
      this.gridApi.forEachNode((node, index) => {
        newData.push(this.gridApi.getDisplayedRowAtIndex(index).data)
      })
      this.rowData = newData
      this.gridApi.refreshClientSideRowModel('group')
    },
    deleteUser: async function() {
      let success = null
      const nodes = this.gridApi.getSelectedNodes()
      consola.info('nodes', nodes)
      if (nodes instanceof Array) {
        consola.log('nodes instanceof Array')
        for (const node of this.gridApi.getSelectedNodes()) {
          consola.info('node', node, node.data.email)
          await axios
            .delete('/api/user', {
              data: {
                username: node.data.email
              }
            })
            .then(response => {
              consola.log('res', response.data.success)
              if (response.data.success) {
                delete this.rowData[node.childIndex]
                consola.log(response.data)
                success = true
              }
            })
            .catch(error => {
              consola.error(error)
              success = false
            })
        }
      }
      consola.log('success', success)
      if (success) {
        this.rowData = this.rowData.filter(() => true)
        this.gridApi.setRowData(this.rowData)
        this.snackbarMessage = 'Nutzer erfolgreich gelöscht'
        this.success = true
      }
    },
    addUser() {
      axios
        .post('/api/user', {
          username: this.newUserEMail,
          role: this.newUserRole
        })
        .then(response => {
          consola.info(response)
          // this.rowData.push()
          this.rowData.push({
            email: response.data.user.username,
            role: response.data.user.role,
            resetPassword: true
          })
          this.gridApi.setRowData(this.rowData)
          this.gridApi.sizeColumnsToFit()
          this.newUserEMail = ''
          this.newUserRole = 'Editor'
          this.$refs.form.resetValidation()
          this.dialog = false
        })
        .catch(error => {
          this.userError = error
        })
    },
    updateCell(params) {
      axios
        .put('/api/user/role', {
          username: params.node.data.email,
          role: params.node.data.role
        })
        .then(response => {
          if (response.data.username) {
            this.snackbarMessage = `Änderung erfolgreich. ${
              response.data.username
            } ist jetzt ${response.data.role}`
            this.success = true
          }
        })
    }
  }
}
</script>
<style lang="scss">
@import '../node_modules/ag-grid-community/dist/styles/ag-grid.css';
@import '../node_modules/ag-grid-community/dist/styles/ag-theme-material.css';
</style>
