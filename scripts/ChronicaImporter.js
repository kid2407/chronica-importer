import {SectionHandler} from "./SectionHandler.js"

export class ChronicaImporter extends FormApplication {
    static SECTIONS = {
        ALL       : ["npcs", "places", "named-npcs"],
        NPCS      : "npcs",
        NAMED_NPCS: "named-npcs",
        LOCATIONS : "places"
    }

    /**
     * A simple logging function.
     *
     * @param data
     * @param {boolean} isError
     */
    static log(data, isError = false) {
        if (typeof data === "string") {
            if (isError) {
                console.error("Chronica-Importer | " + data)
            } else {
                console.log("Chronica-Importer | " + data)
            }
        } else {
            if (isError) {
                console.error("Chronica-Importer | ", data)
            } else {
                console.log("Chronica-Importer | ", data)
            }
        }
    }

    // noinspection JSCheckFunctionSignatures
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
        const sections = Object.keys(formData).filter(key => ChronicaImporter.SECTIONS.ALL.includes(key) && formData[key] === true)
        if (sections.length === 0) {
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
                    /** @type {ImportedData} data */
                    const data = JSON.parse(evt.target.result)
                    instance.updateStatus(game.i18n.localize("chronica-importer.process.parsingFile"), true)
                    const sectionHandler = new SectionHandler(instance)
                    await sectionHandler.handleData(data, sections)
                } catch (exception) {
                    ui.notifications.error(game.i18n.localize("chronica-importer.process.error.invalidFile"), {permanent: true})
                    ChronicaImporter.log(exception, true)
                    instance.updateStatus()
                }
            }
            reader.onerror = function () {
                ui.notifications.error(game.i18n.localize("chronica-importer.process.error.invalidFile"), {permanent: true})
                ChronicaImporter.log(reader.error, true)
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