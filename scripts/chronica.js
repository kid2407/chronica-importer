import {ChronicaImporter} from "./ChronicaImporter.js";

Hooks.on("renderSidebarTab", async (app, html) => {
    if (app.options.id === "journal" && game.user.isGM) {
        let button = $(`<div class="footer-actions action-buttons flexrow"><button class="create-folder"><i class="fas fa-file-import"></i> ${game.i18n.localize("chronica-importer.sidebar-button")}</button></div>`)
        button.on('click', async () => {
            let dialog = new ChronicaImporter()
            return dialog.render(true)
        })
        html.find("footer").append(button)
    }
})