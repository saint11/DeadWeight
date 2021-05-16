const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let { document } = (new JSDOM(`...`)).window;
let { getFromId, getSheet } = require('./data.js');

var md = require('markdown-it')({ html: true, breaks: true });

function makeTable(data, options) {
    var table = document.createElement('table');
    table.style.width = '100%';

    var markdown = require('markdown-it')({ html: false, breaks: true });

    if (options.caption)
        table.innerHTML += `<caption>${options.caption}</caption>`

    for (let i = 0; i < data.length; i++) {
        const element = data[i];

        if (i == 0) {
            Object.entries(element).forEach(el => {
                if (options.exclude && options.exclude.includes(el[0])) return;
                const header = document.createElement('th');
                header.innerHTML = el[0];
                table.appendChild(header);
            });
        }

        if (options.filter && !options.filter(element)) continue;

        const row = document.createElement('tr');

        const entries = Object.entries(element);
        for (let col = 0; col < entries.length; col++) {
            const entry = entries[col];
            if (options.exclude && options.exclude.includes(entry[0])) continue;

            const cell = document.createElement('td');
            cell.innerHTML = col == 0 ? `<b>${markdown.render(capitalizeFirstLetter(entry[1]))}</b>` : markdown.render(addPeriod(entry[1]));
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
    if (!~[".", "!", "?", ";"].indexOf(string[string.length - 1])) string += ".";
    return string;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    makeMonsterTable, makeTable
}