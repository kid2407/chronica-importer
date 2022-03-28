export class ChronicaImporter extends FormApplication {
    async _updateObject(event, formData) {
        return await this.performImport(formData)
    }

    get title() {
        return game.i18n.localize("chronica-importer.dialog.title")
    }

    static get defaultOptions() {
        const options = super.defaultOptions
        options.id = "chronica-importer-dialog"
        options.template = "modules/chronica-importer/templates/dialog.hbs"
        options.width = 800
        options.height = "auto"
        options.resizable = true
        options.closeOnSubmit = false

        return options
    }

    /**
     * @param {String} text
     * @param {boolean} disabled
     */
    updateStatus(text = undefined, disabled = false) {
        const statusField = $('div#chronica-importer-dialog .statusValue')
        if (typeof text == "undefined") {
            text = game.i18n.localize("chronica-importer.dialog.defaultStatus")
        }
        if (disabled) {
            text += "&hellip;"
        }

        statusField.html(text)
    }

    /**
     * @param {Object} formData
     * @returns {Promise<void>}
     */
    async performImport(formData) {
        let allowed = ["npcs", "places"]
        const sections = Object.keys(formData)
            .filter(key => allowed.includes(key) && formData[key] === true)
            .reduce((obj, key) => {
                obj[key] = formData[key];
                return obj;
            }, {});
        if (Object.keys(sections).length === 0) {
            ui.notifications.error(game.i18n.localize("chronica-importer.process.noSectionSelected"))
            this.updateStatus()
            return
        }

        /** @var {File} */
        let file = $('div#chronica-importer-dialog input#importFile')[0].files[0]
        const instance = this
        if (file) {
            instance.updateStatus(game.i18n.localize("chronica-importer.process.loadingFile"), true)
            let reader = new FileReader()
            reader.readAsText(file, "UTF-8")
            reader.onload = async function (evt) {
                try {
                    // noinspection JSCheckFunctionSignatures
                    /** @type {ImportedData} json */
                    const json = JSON.parse(evt.target.result)
                    console.log(json)
                    instance.updateStatus(game.i18n.localize("chronica-importer.process.parsingFile"), true)
                } catch (exception) {
                    ui.notifications.error(game.i18n.localize("chronica-importer.process.error.invalidFile"), {permanent: true})
                    instance.updateStatus()
                }
            }
            reader.onerror = function () {
                ui.notifications.error(game.i18n.localize("chronica-importer.process.error.invalidFile"), {permanent: true})
                instance.updateStatus()
            }
        } else {
            ui.notifications.error(game.i18n.localize("chronica-importer.process.error.noFile"), {permanent: true})
            instance.updateStatus()
        }
    }

    activateListeners(html) {
        super.activateListeners(html)

        let checkboxes = $('div#chronica-importer-dialog table input:checkbox')
        let checkboxCount = checkboxes.length

        // noinspection JSCheckFunctionSignatures
        html.find("a#toggleAllSections").on("click", async (event) => {
            let table = $(event.target).closest("table")
            checkboxes.prop("checked", table.find("input:checkbox:checked").length !== checkboxCount)
        })
    }
}