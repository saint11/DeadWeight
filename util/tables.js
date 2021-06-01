const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let { document } = (new JSDOM(`...`)).window;
let { getFromId, getSheet } = require('./data.js');

var md = require('markdown-it')({ html: true, breaks: true });

const extracts = "Flame,Water,Smoke,Necro,Rot,Ether".split(',');
const monsterTags = toBitwise("living,undead,ghost,goblin,voidspawn,human".split(','));


function makeTable(data, options) {
    console.assert(data, "Can't make table with no data!");

    var table = document.createElement('table');
    table.style.width = '100%';

    var markdown = require('markdown-it')({ html: false, breaks: true });

    if (options.caption)
        table.innerHTML += `<caption>${options.caption}</caption>`

    const enums = {};
    const tags = {};

    for (let i = 0; i < data.length; i++) {
        const element = data[i];

        if (i == 0) {
            const columns = Object.entries(element);

            for (let col = 0; col < columns.length; col++) {
                const el = columns[col];
                if (options.exclude && options.exclude.includes(el[0])) continue;
                const header = document.createElement('th');
                header.innerHTML = el[0];
                
                if (options.styles) {
                    header.style = options.styles[el[0].toLowerCase()];
                }
                table.appendChild(header);

                if (options.tags && options.tags[el[0].toLowerCase()]) {
                    tags[el[0].toLowerCase()] = toBitwise(options.tags[el[0].toLowerCase()]);
                }
                if (options.enums) {
                    enums[el[0].toLowerCase()] = options.enums[el[0].toLowerCase()];
                }
            }
        }

        if (options.filter && !options.filter(element)) continue;

        const row = document.createElement('tr');

        const entries = Object.entries(element);

        for (let col = 0; col < entries.length; col++) {
            const entry = entries[col];
            if (options.exclude && options.exclude.includes(entry[0])) continue;

            const cell = document.createElement('td');

            if (tags[entry[0]]) {
                const text = bitToString(Number.parseInt(entry[1]), tags[entry[0]]);
                cell.innerHTML = text;
            } else if (enums[entry[0]]) {
                const text = enums[entry[0]][Number.parseInt(entry[1])];
                cell.innerHTML = text;
            }
            else {
                const noPeriod = (options.punctuation ?? {})[entry[0].toLowerCase()];
                const text = entry[1];
                cell.innerHTML = col == 0 ? `<b>${markdown.render(capitalizeFirstLetter(text))}</b>` : markdown.render(noPeriod ? text : addPeriod(text));
            }

            row.appendChild(cell);
        }

        table.appendChild(row);
    }

    return table.outerHTML;
}

function makeMonsterTable(monster, actions) {
    var block = document.createElement('div');
    block.classList.add("monster");

    CreateAndPush(monster["Name"] + " - LVL " + monster["Level"], "div", "monster-header", block)

    var attributes = [];
    if (monster["Wounds"] > 0)
        attributes.push("Wounds: " + monster["Wounds"]);
    if (monster["Armor"] > 0)
        attributes.push("Armor: " + monster["Armor"]);
    if (monster["Resistance"] > 0)
        attributes.push("Resist:" + monster["Resistance"]);
    if (monster["Movement"] > 0)
        attributes.push("Movement:" + monster["Movement"]);

    if (attributes.length > 0) {
        CreateAndPush(attributes.join(", "), "div", "monster-attributes", block);
    } else {
        console.log("No attributes for " + monster["Name"]);
    }

    var specials = CreateAndPush('', "p", "monster-special", block);
    for (var key in monster["Special"]) {
        const special = monster["Special"][key]["Description"];
        if (special) {
            CreateAndPush(addPeriod(special), "p", '', specials);
        }
    }

    var actions_list = CreateAndPush('', "div", "monster-actions", block)
    for (var key in monster["Actions"]) {
        const action = monster["Actions"][key]
        const check = action["Check"] ? "(" + action["Check"] + ")" : "";
        const description = action["Description"] ? ": " + action["Description"] : "";

        CreateAndPush("<b>" + action["Name"] + "</b>" + check + addPeriod(description), "div", "monster-action", actions_list)
    }

    for (var key in monster["Common Actions"]) {
        const id = monster["Common Actions"][key]["Action"];
        const action = getFromId(actions, id);
        console.assert(action, "Action not found: " + id);

        const check = action["Check"] ? "(" + action["Check"] + ")" : "";
        const description = action["Description"] ? ": " + action["Description"] : "";

        CreateAndPush("<b>" + action["Name"] + "</b>" + check + addPeriod(description), "div", "monster-action", actions_list)
    }

    var bottomInfo = "";
    if (monster["Tags"])
        bottomInfo += `<p><b>Tags:</b> ${bitToString(monster["Tags"] || 0, monsterTags)}</p>`;

    if (monster["Extract"] >= 0)
        bottomInfo += `<p><b>Extract:</b> ${extracts[monster["Extract"]]}</p>`;

    CreateAndPush(bottomInfo, "div", "monster-extract", block)

    return block.outerHTML;
}


function CreateAndPush(content, content_type, content_class, pushTo) {
    var new_block = document.createElement(content_type);
    new_block.innerHTML = md.render(content);
    if (content_class)
        new_block.classList.add(content_class)
    pushTo.appendChild(new_block);

    return new_block;
}

function addPeriod(string) {
    if (string.length == 0) return '';
    if (!~[".", "!", "?", ";", ")"].indexOf(string[string.length - 1])) string += ".";
    return string;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function toBitwise(array) {
    if (!array) return {};

    var a = {};
    for (let i = 0; i < array.length; i++) {
        const el = array[i];

        a[Math.pow(2, i)] = el;
    };
    return a;
}

function bitToString(int, array) {
    var base2 = (int).toString(2);
    var result = [];
    for (let i = 0; i < base2.length; i++) {
        if (base2[base2.length - i - 1] == 1) {
            result.push(array[Math.pow(2, i)]);
        }
    }
    return result.join(', ');
}

module.exports = {
    makeMonsterTable, makeTable
}