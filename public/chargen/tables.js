tables = {
    infancy: [
        {
            desc: "Tossed in the pit",
            traits: ["Rejected by death"]
        },
        {
            desc: "Feral Kid",
            STR: 1, DEX: 1,
            skills: ["Animal affinity"],
        },
        {
            desc: "Born in Exile",
            STR: 1, INT:1,
            skills: ["Survivalist"],
        },
        {
            desc: "Battleborn",
            STR: 2,
            skills: ["Fearless"],
        },
        {
            desc: "Street Urchin",
            STR: 1, DEX: 1
        },
        {
            desc: "City Kid",
            DEX: 1, PRE: 1
        },
        {
            desc: "Caravan Child",
            PRE: 2
        },
        {
            desc: "Clergy Bastard",
            STR: 1, PRE: 1,
            skills: ["Holy rites"],
        },
        {
            desc: "Occultist’s Apprentice",
            INT: 2,
            skills: ["Occult studies"],
        },
        {
            desc: "Blue Blood",
            PRE: 1, INT: 1
        },
        {
            desc: "Born of a dark prophecy",
            STR: 1, DEX:1, INT:1, PRE:1
        },
    ],


    career: [
        {
            desc: "Deserter Knight",
            STR: 1, STRP: 1,
            skills: ["Duelist"],
        },
        {
            desc: "Squire",
            STR: 1, PRE: 1,
            skills: ["Shield master"],
        },
        {
            desc: "Physician",
            INT: 1, DEX: 1,
            skills: ["Surgery"],
        },
        {
            desc: "Temple worker",
            STR: 1, INT: 1,
            skills: ["Holy rites"],
        },
        {
            desc: "Charlatan",
            STR: 1, PRE: 1
        },
        {
            desc: "Brigand",
            DEX: 1, STR: 1,
            skills: ["Intimidate"],
        },
        {
            desc: "Common Thief",
            PRE: 1, DEX: 1,
            skills: ["Pilfer"],
        },
        {
            desc: "Craftsmen",
            DEX: 1, DEXp: 1,
            skills: ["Crafting"],
        },
        {
            desc: "Occultist",
            INT: 1, INTp: 1,
            skills: ["Occult rites"],
        },
        {
            desc: "Cook",
            DEX: 1, INTp: 1,
            skills: ["Cook"],
        },
        {
            desc: "False Prophet",
            PRE: 1, PREp: 1,
            skills: ["Holy rites"],
        },
    ],
    
    tragedy: [
        {
            desc: "Forced to work on a circus",
            DEXp: 1, INT:-1
        },
        {
            desc: "Afflicted by the plague",
            STR: -1, INTp: 1
        },
        {
            desc: "A murderous impulse",
            DEXp: 1, PRE:-1
        },
        {
            desc: "In debt with a loan shark",
            STR: -1, PREp: 1
        },
        {
            desc: "Lost to the night pleasures",
            INT: -1, PREp: 1
        },
        {
            desc: "Enlisted in a war",
            STRp: 1, INTp:-1
        },
        {
            desc: "Went to jail",
            DEXp:1, STR:-1
        },
        {
            desc: "Enslaved",
            STRp: 1, DEX: -1
        },
        {
            desc: "Lost everything in a disaster",
            STRp: 1, PRE: -1
        },
        {
            desc: "Lover’s revenge",
            PREp: 1, DEX: -1
        },
        {
            desc: "Caged by a powerful wizard",
            INTp: 1, PRE: -1
        },
    ],

    class:[
        {
            name:"Warrior",
            STRp: 1,
            traits: ["Battle trance"],
            skills: ["Bash"],
            equipment:[
                ["Falchion (STR 3+1B)", "Wooden shield", "Scale armor(3 AP)"],
                ["Spear (STR 3+1B)", "Small metal shield", "Padded armor(2 AP)"],
                ["Battle axe (STR 4+2B)", "Loincloth", "War paint"],
            ]
        },
        {
            name:"Thief",
            DEXp: 1,
            traits: ["Cold blooded"],
            skills: ["Stalker"],
            equipment:[
                ["2 Short swords (STR 2+1)", "Leather armor (1 AP)", "Climbing tools", "Stolen golden icon", rollD6() + " silver coins"],
                ["Dagger (STR 1+3P)", "Reinforced hood and vest (1 AP)", "Lock-picking tools", "Ud6 Sleeping darts", rollXD6(3) + " counterfeit coins"],
                ["Ud10 throwing hatchets (DEX 1X+1)", "Animal bones for crafting", "Ud4 trapping kit", "cloth tunic", rollD6() + " silver coins"],
            ]
        },
        {
            name:"Wizard",
            INTp: 1,
            traits: ["Magic user"],
            skills: ["Lore master"],
            equipment:[
                ["Cane (STR 1+1)", "alchemic tools", "tattered trench coat", "old tome (grimoire)", rollXD6(3) + " silver coins", "1 gold coin"],
                ["Sacrificial dagger (STR 1B+1)", "Piece of Chalk", "Poisonous vials", "Inscribed skull (grimoire)", rollXD6(2) + " silver coins"],
                ["Quarterstaff (STR 1+1)", "Ornate garments", "Crystal ball", "Scattered notes (grimoire)", rollXD6(2) + " silver coins"],
            ]
        },
        {
            name:"Cleric",
            PERp: 1,
            traits: ["Divine mandate"],
            skills: ["Banish undead"],
            equipment:[
                ["Flail (STR 2X+2)", "Forbidden scriptures (holy symbol)", "Leather trench coat (1 AP)", rollXD6(3) + " silver coins"],
                ["War hammer (STR 1+3)", "Ancient talisman (holy symbol)", "Ud6 flasks of holy water", "thick cloak (1AP)", rollXD6(3) + " silver coins"],
                ["Notched whip (DEX 1E+2B)", "torture equipment", "rope", "book of sins (holy symbol)", "tattered cloak", rollXD6(1) + " silver coins"],
            ]
        },
    ],

    burden: [
        {
            desc: "Lost everything and everyone"
        },
        {
            desc: "Plagued loved one"
        },
        {
            desc: "An unexplainable impulse"
        },
        {
            desc: "Revenge"
        },
        {
            desc: "Fame and riches"
        },
        {
            desc: "An impossible quest"
        },
        {
            desc: "Redemption"
        },
        {
            desc: "Zealous Fury"
        },
        {
            desc: "Amnesia"
        },
        {
            desc: "An Heir"
        },
        {
            desc: "A Soul Sold"
        },
    ],
}