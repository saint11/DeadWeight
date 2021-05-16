document.addEventListener('DOMContentLoaded', function () {
    fetch(getMeta("data_path") + "data.json")
        .then(response => response.json())
        .then(data => {
            monsters = getSheet(data, "monsters");
            console.assert(monsters, "Monsters database couldn't be loaded");

            actions = getSheet(data, "actions");
            console.assert(actions, "Actions database couldn't be loaded");

            var definitions = getSheet(data, "Definitions");
            var definition_tooltips = document.querySelectorAll(".tip");
            definition_tooltips.forEach(t => {
                const tooltip = document.createElement("span");
                tooltip.classList.add("tooltip");
                const data = getFromId(definitions, remove_spaces(t.innerHTML.trim()));

                if (!data)
                    console.error(`No definition for "${t.innerHTML}"`);
                const description = data["Description"]

                if (description) {
                    tooltip.innerHTML = marked(description);
                    t.appendChild(tooltip);
                }
                else {
                    console.error("No definition for " + t.innerHTML);
                }
            });
        });

    // Monster tooltips
    var monster_tooltips = document.querySelectorAll(".m");
    monster_tooltips.forEach(t => {
        t.addEventListener("mouseover", position_tooltip);
        t.addEventListener("mouseout", hide_tooltip);
    });

})

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

function addPeriod(string) {
    if (!~[".", "!", "?", ";"].indexOf(string[string.length - 1])) string += ".";
    return string;
}

function createMonstersFromJSON(data) {
    var containers = document.getElementsByClassName("monster");
    for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        var monster_table = makeMonsterTable(container.id);
        container.innerHTML = "";
        container.appendChild(monster_table);
    }
}

function makeMonsterTable(id) {
    console.assert(id, "Can't create a monster table without an id!");

    var monster = getFromId(monsters, id.toLowerCase());
    console.assert(monster, id + " not found!");

    var block = document.createElement("div");
    block.classList.add("monster")

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
        console.log("No attributes for " + id);
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

    return block;
}

function CreateAndPush(content, content_type, content_class, pushTo) {
    var new_block = document.createElement(content_type);
    new_block.innerHTML = marked(content);
    if (content_class)
        new_block.classList.add(content_class)
    pushTo.appendChild(new_block);

    return new_block;
}

function getMeta(metaName) {
    const metas = document.getElementsByTagName('meta');

    for (let i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('name') === metaName) {
            return metas[i].getAttribute('content');
        }
    }

    return '';
}

var monster_tooltip;

function position_tooltip() {

    if (monster_tooltip == null) {
        monster_tooltip = document.createElement('span');
        monster_tooltip.classList.add("tooltip_monster")
        document.getElementById("main-document").appendChild(monster_tooltip);
    }
    else {
        monster_tooltip.innerHTML = '';
    }

    var id = this.id;
    if (id == null || id == '')
        id = this.innerHTML;

    monster_tooltip.appendChild(makeMonsterTable(remove_spaces(id)))
    monster_tooltip.classList.add("show");
    monster_tooltip.style.top = (this.offsetTop - monster_tooltip.offsetHeight - 30) + 'px';
}

function hide_tooltip() {
    if (monster_tooltip == null) {
        return;
    }
    else {
        monster_tooltip.classList.remove("show");
    }
}

function remove_spaces(str) {
    return str.replace(/\s+/g, '_').toLowerCase();
}
