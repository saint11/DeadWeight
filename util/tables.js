const cheerio = require("cheerio");
let { getFromId, getSheet } = require('./data.js');

var md = require('markdown-it')({ html: true, breaks: true });

const extracts = "Flame,Water,Smoke,Necro,Rot,Ether".split(',');
const monsterTags = toBitwise("living,undead,ghost,goblin,voidspawn,human".split(','));


function makeTable(data, options) {
    console.assert(data, "Can't make table with no data!");

    const $ = cheerio.load('<table style="width: 100%"></table>', null, false);
    const $table = $('table');

    var markdown = require('markdown-it')({ html: false, breaks: true });

    if (options.caption)
        $table.append(`<caption>${options.caption}</caption>`);

    const enums = {};
    const tags = {};

    for (let i = 0; i < data.length; i++) {
        const element = data[i];

        if (i == 0) {
            const columns = Object.entries(element);

            for (let col = 0; col < columns.length; col++) {
                const el = columns[col];
                if (options.exclude && options.exclude.includes(el[0])) continue;
                const $header = $('<th></th>');
                $header.html(el[0]);

                if (options.styles) {
                    $header.attr('style', options.styles[el[0].toLowerCase()]);
                }
                $table.append($header);

                if (options.tags && options.tags[el[0].toLowerCase()]) {
                    tags[el[0].toLowerCase()] = toBitwise(options.tags[el[0].toLowerCase()]);
                }
                if (options.enums) {
                    enums[el[0].toLowerCase()] = options.enums[el[0].toLowerCase()];
                }
            }
        }

        if (options.filter && !options.filter(element)) continue;

        const $row = $('<tr></tr>');

        const entries = Object.entries(element);

        for (let col = 0; col < entries.length; col++) {
            const entry = entries[col];
            if (options.exclude && options.exclude.includes(entry[0])) continue;

            const $cell = $('<td></td>');

            if (tags[entry[0]]) {
                const text = bitToString(Number.parseInt(entry[1]), tags[entry[0]]);
                $cell.html(text);
            } else if (enums[entry[0]]) {
                const text = enums[entry[0]][Number.parseInt(entry[1])];
                $cell.html(text);
            }
            else {
                const noPeriod = (options.punctuation ?? {})[entry[0].toLowerCase()];
                const text = entry[1];
                $cell.html(col == 0 ? `<b>${markdown.render(capitalizeFirstLetter(text))}</b>` : markdown.render(noPeriod ? text : addPeriod(text)));
            }

            $row.append($cell);
        }

        $table.append($row);
    }

    return $.html();
}

function makeMonsterTable(monster, actions) {
    const $ = cheerio.load('<div class="monster"></div>', null, false);
    const $block = $('div.monster');

    CreateAndPush($, monster["Name"] + " - LVL " + monster["Level"], "div", "monster-header", $block);

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
        CreateAndPush($, attributes.join(", "), "div", "monster-attributes", $block);
    } else {
        console.log("No attributes for " + monster["Name"]);
    }

    var $specials = CreateAndPush($, '', "p", "monster-special", $block);
    for (var key in monster["Special"]) {
        const special = monster["Special"][key]["Description"];
        if (special) {
            CreateAndPush($, addPeriod(special), "p", '', $specials);
        }
    }

    var $actions_list = CreateAndPush($, '', "div", "monster-actions", $block);
    for (var key in monster["Actions"]) {
        const action = monster["Actions"][key]
        const check = action["Check"] ? "(" + action["Check"] + ")" : "";
        const description = action["Description"] ? ": " + action["Description"] : "";

        CreateAndPush($, "<b>" + action["Name"] + "</b>" + check + addPeriod(description), "div", "monster-action", $actions_list);
    }

    for (var key in monster["Common Actions"]) {
        const id = monster["Common Actions"][key]["Action"];
        const action = getFromId(actions, id);
        console.assert(action, "Action not found: " + id);

        const check = action["Check"] ? "(" + action["Check"] + ")" : "";
        const description = action["Description"] ? ": " + action["Description"] : "";

        CreateAndPush($, "<b>" + action["Name"] + "</b>" + check + addPeriod(description), "div", "monster-action", $actions_list);
    }

    var bottomInfo = "";
    if (monster["Tags"])
        bottomInfo += `<p><b>Tags:</b> ${bitToString(monster["Tags"] || 0, monsterTags)}</p>`;

    if (monster["Extract"] >= 0)
        bottomInfo += `<p><b>Extract:</b> ${extracts[monster["Extract"]]}</p>`;

    CreateAndPush($, bottomInfo, "div", "monster-extract", $block);

    return $.html();
}


function CreateAndPush($, content, content_type, content_class, $pushTo) {
    var $new_block = $(`<${content_type}></${content_type}>`);
    $new_block.html(md.render(content));
    if (content_class)
        $new_block.addClass(content_class);
    $pushTo.append($new_block);

    return $new_block;
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
