export class ChronicaImporter extends FormApplication {
    async _updateObject(event, formData) {
        // Stuff to do after submit
        return Promise.resolve(undefined)
    }

    get title() {
        return game.i18n.localize("chronica-importer.dialog.title")
    }

    static get defaultOptions() {
        const options = super.defaultOptions
        options.id = `chronica-importer-dialog`
        options.template = `modules/chronica-importer/templates/dialog.hbs`
        options.width = 800
        options.height = "auto"
        options.resizable = true
        options.closeOnSubmit = false

        return options
    }

    activateListeners(html) {
        super.activateListeners(html)

        let checkboxes = $('div#chronica-importer-dialog table input:checkbox')
        let checkboxCount = checkboxes.length

        html.find("a#toggleAllSections").on("click", async (event) => {
            let table = $(event.target).closest("table")
            checkboxes.prop("checked", table.find("input:checkbox:checked").length !== checkboxCount)
        })
    }
}