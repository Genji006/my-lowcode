// stores/designStore.js
import { defineStore } from 'pinia'

export const useDesignStore = defineStore('design', {
    state: () => ({
        components: [],
        selectedId: null,
        history: [],
        historyIndex: -1
    }),

    getters: {
        selectedComponent: (state) =>
            state.components.find(c => c.id === state.selectedId)
    },

    actions: {
        addComponent(component) {
            this.components.push(component)
            this.saveToHistory()
        },

        updateComponent(id, config) {
            const index = this.components.findIndex(c => c.id === id)
            if (index > -1) {
                this.components[index] = {
                    ...this.components[index],
                    config
                }
                this.saveToHistory()
            }
        },

        selectComponent(id) {
            this.selectedId = id
        },

        saveToHistory() {
            this.history = this.history.slice(0, this.historyIndex + 1)
            this.history.push(JSON.stringify(this.components))
            this.historyIndex++
        },

        undo() {
            if (this.historyIndex > 0) {
                this.historyIndex--
                this.components = JSON.parse(this.history[this.historyIndex])
            }
        },

        redo() {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++
                this.components = JSON.parse(this.history[this.historyIndex])
            }
        }
    }
})