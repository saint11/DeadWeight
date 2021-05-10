const moment = require('moment');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const fs = require('fs-extra')
const chokidar = require('chokidar');

const { getFromId, getSheet } = require('./util/data.js');

const data = JSON.parse(fs.readFileSync('data/data.json', 'utf8'));
const data_monsters = getSheet(data, "monsters");
const data_actions = getSheet(data, "actions");

const { makeMonsterTable } = require('./util/tables.js');
const { title } = require('process');

var mdWeb = require('markdown-it')({ html: true, breaks: true });
const toc_options = {
    level: 1,
    listType: 'ul'
};
mdWeb.use(require("markdown-it-attrs"));
mdWeb.use(require('markdown-it-container-pandoc'))
mdWeb.use(require("markdown-it-anchor"));
mdWeb.use(require("./util/markdown-it-external-toc.js"), toc_options);
mdWeb.use(require('markdown-it-header-sections'))
mdWeb.use(require('markdown-it-bracketed-spans'))
mdWeb.use(require('markdown-it-meta'))
mdWeb.use(require('markdown-it-shortcode-tag'), shortcodes);

var mdPrint = require('markdown-it')({ html: true, breaks: true });
mdPrint.use(require("markdown-it-attrs"));
mdPrint.use(require('markdown-it-container-pandoc'))
mdPrint.use(require("markdown-it-anchor"));
mdPrint.use(require("markdown-it-toc-done-right"));
mdPrint.use(require('markdown-it-header-sections'))
mdPrint.use(require('markdown-it-bracketed-spans'))
mdPrint.use(require('markdown-it-meta'))
mdPrint.use(require('./util/markdown-it-print.js'))
mdWeb.use(require('markdown-it-shortcode-tag'), shortcodes);

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



const publicPath = 'public/';
const outputPath = 'output/';
const sourcePath = 'source/';
const dataPath = 'data/';
const templatesPath = 'templates/';
const staticPath = 'static/';

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
    if (Date.now() - lastProcessedTime < 8000) return;
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
            console.log("========      job done      ========")
        });
    });
}


function processMarkDown(file) {
    var raw = readFile(path.join(sourcePath, file + ".md"));
    console.assert(raw, "Couldn't find markdown source");

    var { dom, linkElement } = getHtmlFromMarkdown(raw, mdWeb);
    var document = dom.window.document;

    // Make draft file
    linkElement.setAttribute('href', 'draft.css');
    saveFile(dom.serialize(), path.join(publicPath, file));

    // Let's make the output now!
    fs.emptyDir(outputPath, err => {
        if (err) return console.error(err);

        // Make web file
        linkElement.setAttribute('href', 'publish.css');
        saveFile(dom.serialize(), path.join(outputPath, file));

        var print = getHtmlFromMarkdown(raw, mdPrint);
        document = print.dom.window.document;
        // Make print A4 file
        print.linkElement.setAttribute('href', 'print-a4.css');
        saveFile(print.dom.serialize(), path.join(outputPath, file + "-a4"));

        print.linkElement.setAttribute('href', 'print-letter.css');
        saveFile(print.dom.serialize(), path.join(outputPath, file + "-letter"));

        // Copy static folder
        fs.copySync(staticPath, publicPath);
        fs.copySync(staticPath, outputPath);

        // Copy all images to the output folder
        fs.copySync(path.join(publicPath, "images/"), path.join(outputPath, "images/"));

        // Copy all css to the output folder
        fs.readdir(publicPath, (err, files) => {
            files.forEach(file => {
                if (path.extname(file) != ".html") {
                    fs.copySync(path.join(publicPath, file), path.join(outputPath, file))
                }
            });
        });

        console.log("Rendered " + file);
    });
}

function saveFile(html, path) {
    var fileName = `${path}.html`;
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

function getHtmlFromMarkdown(str, strategy) {
    var result = strategy.render(str);
    var template = readFile(templatesPath + 'template.html');
    console.assert(template, "Couldn't find template source");

    const dom = new JSDOM(template);
    const document = dom.window.document;

    if (strategy.meta.title) {
        document.title = strategy.meta.title;
        if (!strategy.meta["hide-title"]) {
            const title = document.createElement('h1');
            title.innerHTML = strategy.meta.title;
            document.getElementById("main-document").append(title);
        }
    }


    const toc = document.getElementById("toc");
    if (strategy.meta["toc-title"]) {
        const title = document.createElement('h2');
        title.innerHTML = strategy.meta.title;
        title.id = "toc-title"
        toc.append(title)
    }

    toc.innerHTML += strategy.tocBody;
    document.getElementById("main-document").innerHTML += result;

    var linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('type', 'text/css');
    document.head.append(linkElement);

    return { dom, linkElement };
}