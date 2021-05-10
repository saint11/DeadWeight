const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let { document } = (new JSDOM(`...`)).window;
let { getFromId, getSheet } = require('./data.js');

var md = require('markdown-it')({ html: true, breaks: true });

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

module.exports = {
    makeMonsterTable
}