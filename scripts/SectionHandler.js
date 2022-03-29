import {ChronicaImporter} from "./ChronicaImporter.js"

export class SectionHandler {
    constructor(instance) {
        this.ci = instance
    }

    /**
     * Async for each loop
     *
     * @param  {array} array - Array to loop through
     * @param  {function} callback - Function to apply to each array item loop
     */
    static async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index += 1) {
            await callback(array[index], index, array)
        }
    }

    /**
     * @param {ImportedData} data
     * @param {String[]} sections
     * @returns {Promise<void>}
     */
    async handleData(data, sections) {
        ChronicaImporter.log(data, sections)
        await SectionHandler.asyncForEach(sections, async section => {
            switch (section) {
                case ChronicaImporter.SECTIONS.NPCS:
                    let npcs = data.campaign.entities
                    if (npcs.length > 0) {
                        await this.parseNPCs(data.campaign.entities)
                    }
                    break
                case ChronicaImporter.SECTIONS.LOCATIONS:
                    let locations = data.campaign.places
                    if (locations.length > 0) {
                        await this.parsePlaces(data.campaign.places)
                    }
                    break
            }
        })
    }

    /**
     * @param {NPC[]} npcs
     * @returns {Promise<void>}
     */
    async parseNPCs(npcs) {
        ChronicaImporter.log("Handling NPCs")
        let current = 1
        let count = npcs.length
        this.ci.updateStatus(`Handling NPCs (1 / ${count})`, true)
        await SectionHandler.asyncForEach(npcs, /** @param {NPC} npc */ async npc => {
            ChronicaImporter.log(`Handling NPCs (${current} / ${count})`)
            this.ci.updateStatus(`Handling NPCs (${current} / ${count})`, true)
            let html = await renderTemplate("modules/chronica-importer/templates/sections/npc.hbs", {npc: npc})

            let journalData = {
                name:    npc.name,
                content: html,
                flags:   {
                    "chronica-importer": {
                        "campaign_id": npc.campaign_id,
                        "id":          npc.id,
                        "updated_at":  npc.updated_at
                    }
                }
            }
            await JournalEntry.create(journalData)
            current++
        })
        ChronicaImporter.log("Finished handling NPCs")
    }

    /**
     * @param {Location[]} places
     * @returns {Promise<void>}
     */
    async parsePlaces(places) {
        ChronicaImporter.log("Handling Locations")
        this.ci.updateStatus(`Handling Locations (0 / ${places.length})`)
        ChronicaImporter.log("Finished handling Locations")
    }
}