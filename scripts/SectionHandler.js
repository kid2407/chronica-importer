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
        const transformedAbilities = await this.transformAbilities(data.campaign.ability_types)
        await SectionHandler.asyncForEach(sections, async section => {
            switch (section) {
                case ChronicaImporter.SECTIONS.NPCS:
                    let npcs = data.campaign.entities
                    if (npcs.length > 0) {
                        await this.parseNPCs(data.campaign.entities, transformedAbilities)
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

        ChronicaImporter.log("Import finished!")
        this.ci.updateStatus("Import finished!")
    }

    /**
     * @param {AbilityType[]} abilityTypes
     * @returns {Object}
     */
    async transformAbilities(abilityTypes) {
        let transformedAbilities = {}
        abilityTypes.forEach(/** @var {AbilityType} abilityType */abilityType => abilityType.abilities.forEach(/** @var {Ability} ability */ability => {
            transformedAbilities[ability.id] = ability
        }))

        return transformedAbilities
    }

    /**
     * @param {NPC[]} npcs
     * @param {{[key:number]:Ability}} abilities
     * @returns {Promise<void>}
     */
    async parseNPCs(npcs, abilities) {
        ChronicaImporter.log("Handling NPCs")
        let npcEntriesData = []
        let current = 1
        let count = npcs.length
        this.ci.updateStatus(`Handling NPCs (1 / ${count})`, true)
        await SectionHandler.asyncForEach(npcs, /** @param {NPC} npc */ async npc => {
            ChronicaImporter.log(`Handling NPCs (${current} / ${count})`)
            this.ci.updateStatus(`Handling NPCs (${current} / ${count})`, true)
            let npcAbilities = npc.ability_ids.map(id => {
                return abilities[id]
            })

            npcAbilities.sort((a, b) => b.position - a.position)

            let templateData = {
                npc        : npc,
                "abilities": npcAbilities
            }
            let html = await renderTemplate("modules/chronica-importer/templates/sections/npc.hbs", templateData)

            let journalData = {
                name   : npc.name,
                content: html,
                flags  : {
                    "chronica-importer": {
                        "campaign_id": npc.campaign_id,
                        "id"         : npc.id,
                        "updated_at" : npc.updated_at
                    }
                }
            }
            npcEntriesData.push(journalData)
            current++
        })
        await JournalEntry.createDocuments(npcEntriesData)
        ChronicaImporter.log("Finished handling NPCs")
        this.ci.updateStatus("Finished handling NPCs!")
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