const attributes = ["STR", "DEX", "INT", "PRE"]
var data;

fetch(getMeta("data_path") + "data.json")
    .then(response => response.json())
    .then(loaded => {
        data = getSheet(loaded, "CharacterCreation");
        generateCharacter();
    });

document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('make-character');
    btn.onclick = generateCharacter;
})

function generateCharacter() {
    console.clear();
    var char = new Character();
    char.rollNature();

    var name = document.getElementById('info-name');
    name.innerHTML = generateName();

    var infancy = getFromId(data, "Infancy").Step[roll2D6() - 2];
    document.getElementById('info-infancy').innerHTML = "<b>Infancy</b>: " + infancy.name;
    char.addPhase(infancy);

    var career = getFromId(data, "Career").Step[roll2D6() - 2];
    document.getElementById('info-career').innerHTML = "<b>Career</b>: " + career.name;
    char.addPhase(career);

    var tragedy = getFromId(data, "Tragedy").Step[roll2D6() - 2];
    document.getElementById('info-tragedy').innerHTML = "<b>Tragedy</b>: " + tragedy.name;
    char.addPhase(tragedy);

    var burden = getFromId(data, "Burden").Step[roll2D6() - 2];
    document.getElementById('info-burden').innerHTML = "<b>Burden</b>: " + burden.name;

    // var instinct = tables.instinct[roll2D6()-2];
    // document.getElementById('info-instinct').innerHTML = "<b>Instinct</b>: " + instinct.desc;

    var c_class = getFromId(data, "Class").Step[getRandomInt(0, 4)];
    document.getElementById('c_class').innerHTML = c_class.name;
    char.addPhase(c_class);

    char.finalClamp();

    document.getElementById('str-value').innerHTML = char.STR.toString();
    document.getElementById('dex-value').innerHTML = char.DEX.toString();
    document.getElementById('int-value').innerHTML = char.INT.toString();
    document.getElementById('pre-value').innerHTML = char.PRE.toString();

    document.getElementById('str-proficiency').innerHTML = char.STRp.toString();
    document.getElementById('dex-proficiency').innerHTML = char.DEXp.toString();
    document.getElementById('int-proficiency').innerHTML = char.INTp.toString();
    document.getElementById('pre-proficiency').innerHTML = char.PREp.toString();

    document.getElementById("skill-list").innerHTML = "";
    char.skills.forEach(element => {
        var li = document.createElement("li");
        li.innerHTML = element;
        document.getElementById("skill-list").appendChild(li);
    });

    document.getElementById("trait-list").innerHTML = "";
    char.traits.forEach(element => {
        var li = document.createElement("li");
        li.innerHTML = element;
        document.getElementById("trait-list").appendChild(li);
    });

    document.getElementById("equipment-list").innerHTML = "";
    char.equipment.forEach(element => {
        var li = document.createElement("li");
        li.innerHTML = element;
        document.getElementById("equipment-list").appendChild(li);
    });
}

function rollDice(min, max) {
    var value = min + Math.floor(Math.random() * (max - min + 1));
    return value;
}

const rollD4 = () => rollDice(1, 4);
const rollXD6 = (x) => {
    var total = 0;
    for (let i = 0; i < x; i++) {
        total += rollDice(1, 6);
    }
    return total;
}
const rollD6 = () => rollDice(1, 6);
const roll2D6 = () => rollDice(1, 6) + rollDice(1, 6);
const rollD8 = () => rollDice(1, 8);
const rollD12 = () => rollDice(1, 12);
const rollD20 = () => rollDice(1, 20);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateName() {
    var name1 = ["!sV'i", "!Bv", "!sV", "!Bs"];
    var name2 = ["!sV", "!Dvdv"];
    var n1 = name1[getRandomInt(0, name1.length)];
    var n2 = name2[getRandomInt(0, name2.length)];

    return NameGen.compile(n1).toString() + ' ' + NameGen.compile(n2).toString();
}

class Character {

    constructor() {
        this.STR = 0;
        this.DEX = 0;
        this.INT = 0;
        this.PRE = 0;

        this.STRp = 0;
        this.DEXp = 0;
        this.INTp = 0;
        this.PREp = 0;
    }

    rollNature() {
        this.STR = 1;
        this.DEX = 1;
        this.INT = 1;
        this.PRE = 1;
        this.skills = [];
        this.traits = [];
        this.equipment = [];
    }

    addPhase(phase) {
        this.applyEffects(phase.effect.split(','))

        if (phase.choose_effect.length > 0)
            this.applyEffects(phase.choose_effect[getRandomInt(0, phase.choose_effect.length)].effect.split(','))

        this.clamp();
    }

    applyEffects(effects) {
        effects.forEach(effect => {
            const str = effect.trim()
            var key = str[0];
            var param = str.substring(1);

            // Add attribute score
            if (key == '+') {
                param = param.replace("*", attributes[getRandomInt(0, attributes.length)]);
                this[param] += 1;
            }

            // Remove attribute score
            if (key == '-') {
                param = param.replace("*", attributes[getRandomInt(0, attributes.length)]);
                this[param] -= 1;
            }

            // Add equipment
            if (key == '#') {
                this.equipment.push(param);
            }

            // Add equipment
            if (key == '$') {
                this.skills.push(param);
            }

            // Add equipment
            if (key == '%') {
                this.traits.push(param);
            }
        });
    }

    addPhaseOld(phase) {
        if (phase.STR != null)
            this.STR += phase.STR;
        if (phase.DEX != null)
            this.DEX += phase.DEX;
        if (phase.INT != null)
            this.INT += phase.INT;
        if (phase.PRE != null)
            this.PRE += phase.PRE;


        if (phase.STRp != null)
            this.STRp += phase.STRp;
        if (phase.DEXp != null)
            this.DEXp += phase.DEXp;
        if (phase.INTp != null)
            this.INTp += phase.INTp;
        if (phase.PREp != null)
            this.PREp += phase.PREp;

        if (phase.skills != null)
            this.skills.push(phase.skills);
        if (phase.traits != null)
            this.traits.push(phase.traits);

        if (phase.equipment != null) {
            var equips = phase.equipment[getRandomInt(0, phase.equipment.length)];
            equips.forEach(element => {
                this.equipment.push(element);
            });
        }
    }

    clamp() {
        this.STR = this.STR.clamp(0, 3);
        this.DEX = this.DEX.clamp(0, 3);
        this.INT = this.INT.clamp(0, 3);
        this.PRE = this.PRE.clamp(0, 3);

        this.STRp = this.STRp.clamp(0, 2);
        this.DEXp = this.DEXp.clamp(0, 2);
        this.INTp = this.INTp.clamp(0, 2);
        this.PREp = this.PREp.clamp(0, 2);
    }

    finalClamp() {
        this.STR = this.STR.clamp(1, 3);
        this.DEX = this.DEX.clamp(1, 3);
        this.INT = this.INT.clamp(1, 3);
        this.PRE = this.PRE.clamp(1, 3);

        this.STRp = this.STRp.clamp(0, 2);
        this.DEXp = this.DEXp.clamp(0, 2);
        this.INTp = this.INTp.clamp(0, 2);
        this.PREp = this.PREp.clamp(0, 2);
    }
}

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};


function getMeta(metaName) {
    const metas = document.getElementsByTagName('meta');

    for (let i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('name') === metaName) {
            return metas[i].getAttribute('content');
        }
    }

    return '';
}


function getSheet(data, id) {
    var sheets = data["sheets"]

    for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        if (sheet["name"].toLowerCase() == id.toLowerCase()) {
            return sheet["lines"];
        }
    }

    console.error("Can't find sheet with id " + id);
    return null;
}

function getFromId(data, id) {
    for (let i = 0; i < data.length; i++) {
        const sheet = data[i];
        if (sheet["id"].toLowerCase() == id.toLowerCase()) {
            return sheet;
        }

        if (sheet["id"].toLowerCase() + "s" == id.toLowerCase()) {
            return sheet;
        }

        if (sheet["id"].toLowerCase() + "es" == id.toLowerCase()) {
            return sheet;
        }
    }

    return null;
}