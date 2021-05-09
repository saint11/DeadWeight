
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

module.exports = {
    getFromId, getSheet
}