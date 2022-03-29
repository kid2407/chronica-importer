export interface NPC {
    "id": Number
    "campaign_id": Number
    "name": String,
    "description": String,
    "notes": String,
    "entity_type": String,
    "created_at": String,
    "updated_at": String,
    "ability_ids": Number[],
    "disposition": String
}

export interface Location {
    "id": Number
    "campaign_id": Number
    "name": String,
    "description": String,
    "notes": String,
    "gm_secrets": String,
    "pc_secret": String,
    "location": String,
    "created_at": String,
    "updated_at": String,
    "anchestry": undefined,
    "position": undefined
}

export interface ImportedData {
    "campaign": {
        "id": Number
        "name": String,
        "about": String,
        "created_at": String,
        "updated_at": String,
        "gm_secrets": String,
        "game_system": String,
        "party_wealth": String,
        "players_count": Number
        "ability_types": [],
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
    "export_created_at": String
}