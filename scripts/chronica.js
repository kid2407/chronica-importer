Hooks.on("renderSidebarTab", async (app, html) => {
    if (app.options.id === "journal" && game.user.isGM) {
        html.find("footer").append('<div class="footer-actions action-buttons flexrow"><button class="create-folder"><i class="fas fa-file-import"></i> Import Chronica Data</button></div>')
    }
})