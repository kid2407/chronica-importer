export interface Ability {
    ability_type_id: number,
    abilitytag_list: [],
    created_at: string,
    id: number,
    long_description: string,
    name: string,
    position: number,
    short_description: string,
    updated_at: string
}

export interface AbilityType {
    abilities: Ability[],
    ability_type_folder_id: number,
    campaign_id: number,
    created_at: string,
    id: number,
    name: string,
    pc_secret: boolean,
    position: number,
    updated_at: string
}

export interface NPC {
    "id": number
    "campaign_id": number
    "name": string,
    "description": string,
    "notes": string,
    "entity_type": string,
    "created_at": string,
    "updated_at": string,
    "ability_ids": number[],
    "disposition": string
}

export interface Location {
    "id": number
    "campaign_id": number
    "name": string,
    "description": string,
    "notes": string,
    "gm_secrets": string,
    "pc_secret": string,
    "location": string,
    "created_at": string,
    "updated_at": string,
    "anchestry": undefined,
    "position": undefined
}

export interface ImportedData {
    "campaign": {
        "id": number
        "name": string,
        "about": string,
        "created_at": string,
        "updated_at": string,
        "gm_secrets": string,
        "game_system": string,
        "party_wealth": string,
        "players_count": number
        "ability_types": AbilityType[],
        "char_stat_types": [],
        "characters": [],
        "cities": [],
        "city_stats": [],
        "encounters": [],
        "entities": NPC[],
        "events": [],
        "inventories": [],
        "journal_posts": [],
        "kinships": [],
        "maps": [],
        "places": Location[],
        "players": [],
        "plots": [],
        "quests": []
    },
    "export_created_at": string
}