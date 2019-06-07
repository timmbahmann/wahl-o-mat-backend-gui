<template>
  <div>
    <h1 class="display-3 my-5 text-xs-center">
      {{ name }}
    </h1>
    <v-snackbar v-model="success" :top="true" :color="color">
      {{ snackbarMessage }}
    </v-snackbar>
    <div style=" overflow: hidden; flex-grow: 1">
      <ag-grid-vue
        ref="grid"
        style="width: 100%;"
        class="ag-theme-material"
        :column-defs="columnDefs"
        :row-data="rowData"
        :grid-options="gridOptions"
        :default-col-def="defaultColDef"
        :row-drag-managed="true"
        :animate-rows="true"
        :row-selection="rowSelection"
        :suppress-row-click-selection="true"
        :dom-layout="'autoHeight'"
        :framework-components="frameworkComponents"
        @row-drag-end="onRowDragEnd"
        @grid-ready="onGridReady"
        @cell-value-changed="updateCell"
      >
      </ag-grid-vue>
      <v-btn @click="deleteThese">
        Ausgewählte Thesen entfernen
      </v-btn>
      <v-dialog v-model="dialog2" width="500">
        <template v-slot:activator="{ on }">
          <v-btn color="green" dark v-on="on">
            Wahlteilnehmer hinzufügen
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>
            Wahlteilnehmer hinzufügen
          </v-card-title>

          <v-card-text>
            <p v-if="wahlteilnehmerError !== ''">
              {{ wahlteilnehmerError }}
            </p>
            <v-form ref="form" v-model="valid2" @submit.prevent>
              <v-text-field
                v-model="wahlteilnehmer"
                label="Wahlteilnehmer"
                :rules="thesenRules"
                required
                full-width
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn color="error" flat @click="dialog2 = false">
              Abbrechen
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="green" flat @click="addWahlteilnehmer">
              Wahlteilnehmer hinzufügen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on }">
          <v-btn color="green" dark v-on="on">
            These hinzufügen
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline grey lighten-2" primary-title>
            These hinzufügen
          </v-card-title>

          <v-card-text>
            <p v-if="theseError !== ''">
              {{ theseError }}
            </p>
            <v-form ref="form" v-model="valid" @submit.prevent>
              <v-text-field
                v-model="these"
                label="These"
                :rules="thesenRules"
                required
                full-width
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn color="error" flat @click="dialog = false">
              Abbrechen
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="green" flat @click="addThese">
              These hinzufügen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>
<script>
import consola from 'consola'
import axios from 'axios'
import { AgGridVue } from 'ag-grid-vue'
import CustomHeader from '~/components/customHeader.vue'

export default {
  components: {
    AgGridVue
  },
  data() {
    return {
      name: this.$route.params.wahlname,
      columnDefs: null,
      frameworkComponents: null,
      these: '',
      random: Math.random(),
      wahlteilnehmer: '',
      color: 'green',
      rowData: null,
      defaultAnswers: {},
      gridOptions: null,
      defaultColDef: {
        editable: true,
        resizable: true,
        sortable: true,
        filter: 'agTextColumnFilter'
      },
      rowSelection: null,
      dialog: false,
      active: true,
      dialog2: false,
      valid: false,
      valid2: false,
      theseError: '',
      wahlteilnehmerError: '',
      success: false,
      snackbarMessage: '',
      headerID: 0,
      thesenRules: [v => !!v || 'These darf nicht leer sein']
    }
  },
  middleware: 'auth',
  async beforeMount() {
    this.gridOptions = {}
    await axios
      .get(`/api/wahl/${encodeURIComponent(this.name)}`)
      .then(response => {
        consola.log('response', response.data[0])
        let cols = []
        if (
          response.data[0].thesen !== undefined &&
          response.data[0].thesen[0].antworten instanceof Array
        ) {
          cols = response.data[0].thesen[0].antworten.map(antwort => {
            return {
              headerName: antwort.name,
              field: encodeURIComponent(antwort.name),
              editable: true,
              cellEditor: 'agSelectCellEditor',
              headerComponentFramework: CustomHeader,
              headerComponentParams: { headerID: this.headerID++ },
              cellEditorParams: {
                values: ['ja', 'nein', 'neutral']
              }
            }
          })
          this.rowData = response.data[0].thesen.map(these => {
            const row = {}
            row.these = these.these
            consola.log(these)
            these.antworten.map(antwort => {
              row[encodeURIComponent(antwort.name)] = antwort.antwort
              this.defaultAnswers[encodeURIComponent(antwort.name)] = 'neutral'
            })
            return row
          })
          consola.log(this.rowData)
          this.gridApi.sizeColumnsToFit()
        }
        this.columnDefs = [
          {
            headerName: 'These',
            field: 'these',
            rowDrag: true,
            pinned: 'left',
            editable: true,
            width: 300,
            headerCheckboxSelection: true,
            checkboxSelection: true
          },
          ...cols
        ]
      })
    this.rowSelection = 'multiple'
    this.frameworkComponents = {}
  },
  mounted() {
    this.$bus.$off()
    this.gridApi = this.gridOptions.api
    this.gridColumnApi = this.gridOptions.columnApi
    this.$bus.$on('deleteCol', this.deleteCol)
  },
  methods: {
    deleteCol(data) {
      consola.info('hö?', this.columnDefs, data.rand)
      if (this.columnDefs.length <= 2) {
        this.color = 'red'
        this.snackbarMessage =
          'Es muss mindestens ein Wahlteilnehmer vorhanden sein!'
        this.success = true
        return
      }
      consola.log('hier?', this.gridOptions.api, ' ju', data.rand)
      const colInd = this.columnDefs.findIndex(
        x => x.field === encodeURIComponent(data.displayName)
      )
      for (let i = 0; i < this.rowData.length; i++) {
        delete this.rowData[i][encodeURIComponent(data.displayName)]
      }
      this.rowData = this.rowData.filter(() => true)
      delete this.columnDefs[colInd]
      this.columnDefs = this.columnDefs.filter(() => true)
      this.gridOptions.api.setColumnDefs(this.columnDefs)
      this.save()
    },
    getWahlObject() {
      const thesen = this.rowData.map(row => {
        const antworten = []
        for (const [key, value] of Object.entries(row)) {
          if (key !== 'these') {
            antworten.push({
              antwort: value,
              name: decodeURIComponent(key)
            })
          }
        }
        return {
          these: row.these,
          antworten: antworten
        }
      })
      return {
        name: this.name,
        gremium: 'xxx',
        thesen: thesen
      }
    },
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
      this.save()
    },
    updateCell(params) {
      consola.info('update', params)
      this.save()
    },
    deleteThese() {
      consola.log('delete these')
      const nodes = this.gridApi.getSelectedNodes()
      consola.log(this.rowData.length, nodes.length)
      if (this.rowData.length <= nodes.length) {
        this.snackbarMessage = 'Es muss mindestens eine These vorhanden sein!'
        this.color = 'red'
        this.success = true
        return
      }
      consola.info('nodes', nodes)
      if (nodes instanceof Array) {
        for (const node of this.gridApi.getSelectedNodes()) {
          delete this.rowData[node.childIndex]
        }
      }
      this.rowData = this.rowData.filter(() => true)
      this.gridApi.setRowData(this.rowData)
      this.snackbarMessage = 'These erfolgreich gelöscht'
      this.color = 'green'
      this.success = true
      this.save()
    },
    addThese() {
      consola.log('add these')
      this.rowData.push({
        these: this.these,
        ...this.defaultAnswers
      })
      this.gridApi.setRowData(this.rowData)
      this.save()
      this.dialog = false
    },
    addWahlteilnehmer() {
      this.defaultAnswers[encodeURIComponent(this.wahlteilnehmer)] = 'neutral'
      const columnDefs = this.gridOptions.columnDefs
      columnDefs.push({
        headerName: this.wahlteilnehmer,
        field: encodeURIComponent(this.wahlteilnehmer),
        editable: true,
        cellEditor: 'agSelectCellEditor',
        headerComponentFramework: CustomHeader,
        headerComponentParams: { headerID: this.headerID++ },
        cellEditorParams: {
          values: ['ja', 'nein', 'neutral']
        }
      })
      consola.log('add')
      this.gridOptions.api.setColumnDefs(columnDefs)
      this.rowData.map(v => {
        v[encodeURIComponent(this.wahlteilnehmer)] = 'neutral'
      })
      this.save()
      this.dialog2 = false
    },
    save() {
      consola.log(this.getWahlObject())
      const wahlObj = this.getWahlObject()
      axios
        .put(`/api/wahl/${encodeURIComponent(this.name)}`, wahlObj)
        .then(response => {
          consola.log(response.data)
        })
    }
  }
}
</script>
<style lang="scss">
@import '~/node_modules/ag-grid-community/dist/styles/ag-grid.css';
@import '~/node_modules/ag-grid-community/dist/styles/ag-theme-material.css';
</style>
