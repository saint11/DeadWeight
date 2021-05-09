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
const { title } = require('process');

var md = require('markdown-it')({ html: true, breaks: true });

md.use(require("markdown-it-anchor"));
md.use(require("markdown-it-toc-done-right"));
md.use(require("markdown-it-attrs"));
md.use(require('markdown-it-header-sections'))
md.use(require('markdown-it-meta'))
// md.use(require('./util/markdown-it-print.js'))

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

const publicPath = 'public/';
const sourcePath = 'source/';
const dataPath = 'data/';

// Start the server for testing
const PORT = process.env.PORT || 3000;
const server = http.createServer(app)
app.use(express.static(path.join(__dirname, publicPath)));
server.listen(PORT, () => console.log(`======== Server started [${moment().format('h:mm a')}] ========`));
processSourcesFolder();

var lastProcessedTime = Date.now();
chokidar.watch(sourcePath).on('all', (event, path) => {
    processSourcesFolder();
});

chokidar.watch(dataPath).on('all', (event, path) => {
    processSourcesFolder();
});

function processSourcesFolder() {
    if (Date.now() - lastProcessedTime < 4000) return;
    lastProcessedTime = Date.now();

    console.log("======== updating sources folder ========")

    fs.readdir(sourcePath, (err, files) => {
        const renderedFiles = [];
        files.forEach(file => {
            if (path.extname(file) == ".md") {
                const fileName = file.substr(0, file.lastIndexOf("."));
                processMarkDown(fileName);
                renderedFiles.push(fileName);
            }
        });

        fs.readdir(publicPath, (err, files) => {
            files.forEach(file => {
                if (path.extname(file) == ".html") {
                    const fileName = file.substr(0, file.lastIndexOf("."));
                    if (renderedFiles.findIndex(f => f == fileName) >= 0) return;

                    fs.unlinkSync(path.join(publicPath, file));
                    console.log("removed " + file);
                }
            });
            console.log("======== job done ========")
        });
    });
}


function processMarkDown(file) {
    var raw = readFile(path.join(sourcePath, file + ".md"));
    console.assert(raw, "Couldn't find markdown source");

    var template = readFile(sourcePath + 'template.html');
    console.assert(raw, "Couldn't find template source");

    var result = md.render(raw);
    
    const dom = new JSDOM(template);
    const document = dom.window.document;
    
    document.title = md.meta.title;
    const title = document.createElement('h1');
    title.innerHTML = md.meta.title;
    document.getElementById("main-document").append(title);

    document.getElementById("main-document").innerHTML += result;

    saveFile(dom.serialize(), file);

    console.log("Rendered " + file);
}

function saveFile(html, path) {
    var fileName = `public/${path}.html`;
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

