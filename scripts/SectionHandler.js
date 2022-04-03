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
        let campaignFolders = game.folders.contents.filter(/** @param {Folder} folder */folder => folder.getFlag("chronica-importer", "campaign-id") === data.campaign.id)
        if (campaignFolders.length === 0) {
            this.campaignFolder = await Folder.create({
                name : data.campaign.name,
                type : "JournalEntry",
                flags: {
                    "chronica-importer": {
                        "campaign-id": data.campaign.id
                    }
                }
            })
        } else {
            this.campaignFolder = campaignFolders[0]
        }

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

        let npcFolder
        let npcFolders = game.folders.contents.filter(/** @param {Folder} folder */folder => folder.type === "JournalEntry" && folder.getFlag("chronica-importer", "npc-folder") !== undefined)
        if (npcFolders.length === 0) {
            npcFolder = await Folder.create({
                name  : "NPCs",
                type  : "JournalEntry",
                parent: this.campaignFolder.id,
                flags : {
                    "chronica-importer": {
                        "npc-folder": true
                    }
                }
            })
        } else {
            npcFolder = npcFolders[0]
        }

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
                },
                folder : npcFolder.id
            }
            npcEntriesData.push(journalData)
            current++
        })

        await JournalEntry.createDocuments(npcEntriesData)
        ChronicaImporter.log("Finished handling NPCs")
        this.ci.updateStatus("Finished handling NPCs!")
    }

    /**
     * @param {Place[]} locations
     * @returns {Promise<void>}
     */
    async parsePlaces(locations) {
        ChronicaImporter.log("Handling Places")
        let placesData = []
        let current = 1
        let count = locations.length

        let placesFolder
        let placesFolders = game.folders.contents.filter(/** @param {Folder} folder */folder => folder.type === "JournalEntry" && folder.getFlag("chronica-importer", "location-folder") !== undefined)
        if (placesFolders.length === 0) {
            placesFolder = await Folder.create({
                name  : "Places",
                type  : "JournalEntry",
                parent: this.campaignFolder.id,
                flags : {
                    "chronica-importer": {
                        "location-folder": true
                    }
                }
            })
        } else {
            placesFolder = placesFolders[0]
        }

        await SectionHandler.asyncForEach(locations, /** @param {Place} place */ async place => {
            ChronicaImporter.log(`Handling Places (${current} / ${count})`)
            this.ci.updateStatus(`Handling Places (${current} / ${count})`, true)

            let html = await renderTemplate("modules/chronica-importer/templates/sections/place.hbs", {place: place})

            let journalData = {
                name   : place.name,
                content: html,
                flags  : {
                    "chronica-importer": {
                        "campaign_id": place.campaign_id,
                        "id"         : place.id,
                        "updated_at" : place.updated_at
                    }
                },
                folder : placesFolder.id
            }
            placesData.push(journalData)
            current++
        })

        await JournalEntry.createDocuments(placesData)

        ChronicaImporter.log("Finished handling Places")
    }
}