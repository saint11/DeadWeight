var uslug = require("uslug");
const moment = require('moment');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const fs = require('fs-extra')
const chokidar = require('chokidar');
const dataJsonPath = './data/data.json';

const { getFromId, getSheet } = require('./util/data.js');

const data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
const data_monsters = getSheet(data, "monsters");
const data_items = getSheet(data, "items");
const data_weapons = getSheet(data, "weapons");
const data_actions = getSheet(data, "actions");

const { makeMonsterTable, makeTable } = require('./util/tables.js');
const { title } = require('process');
const { SlowBuffer } = require('buffer');
var shortcodes = {
    monster: {
        render: function (attrs, env) {
            const monster = getFromId(data_monsters, attrs.id);
            console.assert(monster, "Cannot find monster " + attrs.id);
            return makeMonsterTable(monster, data_actions);
        }
    },
    itemTable: {
        render: function (attrs, env) {
            const options = {
                exclude: ["rarity"],
                bold: [0],
                filter: el => el["rarity"] == attrs.id,
                caption: attrs.caption,
                tags: { tags: ["Quick", "Slow", "Camp", "Equipment"] }
            };
            return makeTable(data_items, options);
        }
    },
    weaponTable: {
        render: function (attrs, env) {
            const options = {
                exclude: ["rarity"],
                bold: [0],
                filter: el => el["rarity"] == attrs.id,
                caption: attrs.caption,
                punctuation: { stats: true },
            };
            return makeTable(data_weapons, options);
        }
    },
    break: {
        render: function (attrs, env) {
            return `<div style="clear: both;"></div>`;
        }
    },

    now: {
        render: function (attrs, enc) {
            return moment().format('h:mm a, Do MMMM YYYY');
        }
    },

    pagebreak: {
        render: function (attrs, env) {
            pageCount++;
            return '';
        }
    },

    d6: {
        render: function (attrs, env) {
            return `<img src="images/dice-${attrs.v}.svg" class="dice"/>`
        }
    }
}
const headingOptions = {
    linkIcon: '<i class="fas fa-link"></i>',
    prefix: ''
};
var mdWeb = require('markdown-it')({ html: true, breaks: false });
const toc_options = {
    level: 1,
    listType: 'ul',
    slugify: s => {
        return uslug(s);
    }
};
mdWeb.use(require("markdown-it-attrs"));
mdWeb.use(require("markdown-it-task-lists"));
mdWeb.use(require('markdown-it-container-pandoc'))
mdWeb.use(require("markdown-it-github-headings"), headingOptions);
mdWeb.use(require("./util/markdown-it-external-toc.js"), toc_options);
mdWeb.use(require('markdown-it-header-sections'))
mdWeb.use(require('markdown-it-bracketed-spans'))
mdWeb.use(require('markdown-it-meta'))
mdWeb.use(require('markdown-it-multimd-table'))
mdWeb.use(require('markdown-it-shortcode-tag'), shortcodes);

var mdPrint = require('markdown-it')({ html: true, breaks: true });
mdPrint.use(require("markdown-it-attrs"));
mdPrint.use(require('markdown-it-container-pandoc'))
mdPrint.use(require("markdown-it-anchor"));
mdPrint.use(require("markdown-it-toc-done-right"));
mdPrint.use(require('markdown-it-header-sections'))
mdPrint.use(require('markdown-it-bracketed-spans'))
mdPrint.use(require('markdown-it-meta'))
mdPrint.use(require('markdown-it-multimd-table'))
mdPrint.use(require('./util/markdown-it-print.js'))
mdPrint.use(require('markdown-it-shortcode-tag'), shortcodes);

var pageCount = -1;

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


function throughDirectory(directory) {
    files = [];

    function cycleDirectory(directory_path) {
        fs.readdirSync(directory_path).forEach(file => {
            const absolute = path.join(directory_path, file);
            if (fs.statSync(absolute).isDirectory()) return cycleDirectory(absolute);
            else return files.push(absolute);
        });
    }

    cycleDirectory(directory);
    return files;
}

function processSourcesFolder() {
    if (Date.now() - lastProcessedTime < 8000) return;
    lastProcessedTime = Date.now();

    fs.emptyDirSync(outputPath);

    console.log("======== updating sources folder ========")
    fs.readdir(publicPath, (err, files) => {
        files.forEach(file => {
            if (path.extname(file) == ".html") {
                fs.unlinkSync(path.join(publicPath, file));
                console.log("removed " + file);
            }
        });

        var files = throughDirectory(sourcePath);
        const renderedFiles = [];
        files.forEach(file => {
            if (path.extname(file) == ".md") {
                const fileName = file.substr(0, file.lastIndexOf("."));
                processMarkDown(fileName);
                renderedFiles.push(fileName);
            }
        });

        // Copy static folder
        fs.copySync(staticPath, publicPath);
        fs.copySync(staticPath, outputPath);
        fs.copySync(dataJsonPath, publicPath + "data.json");
        fs.copySync(dataJsonPath, outputPath + "data.json");

        // Copy all images to the output folder
        requireDir(path.join(publicPath, "images/"));
        fs.copySync(path.join(publicPath, "images/"), path.join(outputPath, "images/"));

        // Copy all extra files to the output folder
        fs.readdir(publicPath, (err, files) => {
            files.forEach(file => {
                if (path.extname(file) != ".html") {
                    fs.copySync(path.join(publicPath, file), path.join(outputPath, file))
                    // console.log(`${path.join(publicPath, file)} to ${path.join(outputPath, file)}`)
                }
            });
        });

        console.log("========      job done      ========")
    });


}


function processMarkDown(fileName) {
    const file = fileName.substr(sourcePath.length);

    const depth = fileName.split(/\/.+?/g).length;

    var raw = readFile(path.join(sourcePath, file + ".md"));
    console.assert(raw, "Couldn't find markdown source");

    var { dom, linkElement } = getHtmlFromMarkdown(raw, mdWeb);
    var document = dom.window.document;

    // Make draft file
    linkElement.setAttribute('href', '../'.repeat(depth) + (mdWeb.meta.css ? mdWeb.meta.css : 'draft.css'));
    saveFile(dom.serialize(), path.join(publicPath, file));

    // Let's make the output now!

    // Make web file
    linkElement.setAttribute('href', '../'.repeat(depth - 1) + (mdWeb.meta.css ? mdWeb.meta.css : 'publish.css'));
    saveFile(dom.serialize(), path.join(outputPath, file));

    if (mdWeb.meta.print) {
        var print = getHtmlFromMarkdown(raw, mdPrint, 'print');
        document = print.dom.window.document;

        // Make print A4 file
        print.linkElement.setAttribute('href', 'print-a4.css');
        saveFile(print.dom.serialize(), path.join(publicPath, file + "-a4"));
        saveFile(print.dom.serialize(), path.join(outputPath, file + "-a4"));

        // Make print letter file
        print.linkElement.setAttribute('href', 'print-letter.css');
        saveFile(print.dom.serialize(), path.join(outputPath, file + "-letter"));

        console.log("Rendered " + file);
    }
    else
        console.log("Rendered " + file + " (web only)");

}

function saveFile(html, filePath) {
    var fileName = `${filePath}.html`;
    // console.log("Writing " + fileName);

    requireDir(fileName);

    fs.writeFileSync(fileName, html, err => {
        console.log(err);
    })
}

function requireDir(filePath) {
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath));
    }
}

function readFile(file_path) {
    try {
        var data = fs.readFileSync(file_path, 'utf8');
        return data;
    } catch (e) {
        console.log('Error:', e.stack);
    }
}

function getHtmlFromMarkdown(str, strategy, templateSuffix) {
    var result = strategy.render(str);

    const templatePath = `${templatesPath}template${strategy.meta.template ? '-' + strategy.meta.template : ''}${templateSuffix ? '-' + templateSuffix : ''}.html`;
    var template = readFile(templatePath);
    console.assert(template, "Couldn't find template source");

    Object.entries(strategy.meta).forEach(attr => {
        template = template.replace("$" + attr[0], attr[1]);
    });

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
    if (toc) {
        if (strategy.meta["toc"]) {
            if (strategy.meta["toc-title"]) {
                const title = document.createElement('h2');
                title.innerHTML = strategy.meta["toc-title"];
                title.id = "toc-title"
                toc.appendChild(title)
            }
            toc.innerHTML += strategy.tocBody;

            if (strategy.meta["links"]) {
                const link = document.createElement('div');
                link.innerHTML += `<h2 style="margin-bottom:2px; margin-top:30px">${strategy.meta["links-title"]}</h2><ul>`;
                strategy.meta["links"].split(',').forEach((el) => {
                    const split = el.split("\|");
                    if (split[0].endsWith("*")) {
                        link.innerHTML += `<li class="selected">${split[0].trim().slice(0, -1)}</li>`;
                    }
                    else {
                        link.innerHTML += `<li><a href="./${split[1] ?? split[0].trim().toLowerCase()}.html">${split[0].trim()}</a></li>`;
                    }
                    toc.appendChild(link)
                })
                link.innerHTML += `</ul>`;
            }
        }
        else {
            toc.parentElement.remove();
        }
    }

    document.getElementById("main-document").innerHTML += result;

    // Monster tooltips
    // var monster_tooltips = document.querySelectorAll(".m");
    // monster_tooltips.forEach(t => {
    //     t.setAttribute("onmouseover", 'position_tooltip(this)');
    //     t.setAttribute("onmouseout", 'hide_tooltip(this)');
    // });

    // monster_tooltips.forEach(monsterSpan => {
    //     var id = monsterSpan.getAttribute("id");
    //     if (!id)
    //         id = monsterSpan.innerHTML.toLowerCase().replaceAll(" ", "_");
    //     const monster = getFromId(data_monsters, id);
    //     console.assert(monster, "Can't find monster with id " + id);

    //     var tableDiv = document.createElement('div');
    //     tableDiv.innerHTML= makeMonsterTable(monster, data_actions);

    //     tableDiv.classList.add ("tooltiptext");
    //     monsterSpan.classList.add("tooltip");
    //     monsterSpan.appendChild(tableDiv);
    // });

    var linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('type', 'text/css');
    document.head.append(linkElement);

    var faAwesome = document.createElement('script');
    faAwesome.setAttribute('src', 'https://kit.fontawesome.com/ba93eb1f54.js');
    faAwesome.setAttribute('crossorigin', 'anonymous');
    document.head.append(faAwesome);


    return { dom, linkElement };
}