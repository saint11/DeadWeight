const moment = require('moment');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
var fs = require('fs');
const chokidar = require('chokidar');

const { getFromId, getSheet } = require('./util/data.js');

const data = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));
const data_monsters = getSheet(data, "monsters");
const data_actions = getSheet(data, "actions");

const { makeMonsterTable } = require('./util/tables.js');

var md = require('markdown-it')({ html: true, breaks: true });

md.use(require("markdown-it-anchor"));
md.use(require("markdown-it-toc-done-right"));
md.use(require("markdown-it-attrs"));
md.use(require('markdown-it-header-sections'))
md.use(require('./util/markdown-it-print.js'))

var pageCount = -1;

var shortcodes = {
    monster: {
        render: function (attrs, env) {
            const monster = getFromId(data_monsters, attrs.id);
            return makeMonsterTable(monster, data_actions);
        }
    },
    pagebreak: {
        render: function (attrs, env) {
            pageCount++;
            return '';
        }
    }
}


md.use(require('markdown-it-shortcode-tag'), shortcodes);

const sourcePath = 'source/';
const dataPath = 'data/';

// Start the server for testing
const PORT = process.env.PORT || 3000;
const server = http.createServer(app)
app.use(express.static(path.join(__dirname, 'public')));
server.listen(PORT, () => console.log(`======== Server started [${moment().format('h:mm a')}] ========`));
processMarkDown('bestiary.md');

chokidar.watch(sourcePath).on('all', (event, path) => {
    console.log(`-> Source updated (${event}, ${path})`);
    processMarkDown('bestiary.md');
});

chokidar.watch(dataPath).on('all', (event, path) => {
    console.log(`-> Data updated (${event}, ${path})`);
    processMarkDown('bestiary.md');
});


function processMarkDown(file) {
    var raw = readFile(path.join(sourcePath, file));
    console.assert(raw, "Couldn't find markdown source");

    var template = readFile(sourcePath + 'template.html');
    console.assert(raw, "Couldn't find template source");

    var result = md.render(raw);

    const dom = new JSDOM(template);
    dom.window.document.getElementById("main-document").innerHTML = result;

    saveFile(dom.serialize());

    console.log("======== Render done");
}

function saveFile(html) {
    var fileName = 'public/index.html';
    var stream = fs.createWriteStream(fileName);
    stream.once('open', function (fd) {
        stream.end(html);
    });
}

function readFile(file_path) {
    try {
        var data = fs.readFileSync(file_path, 'utf8');
        return data;
    } catch (e) {
        console.log('Error:', e.stack);
    }
}

// Set static folder


function buildHtml() {
    var header = '';
    var body = '';

    // concatenate header string
    // concatenate body string

    return '<!DOCTYPE html>'
        + '<html><head>' + header + '</head><body>' + body + '</body></html>';
};

