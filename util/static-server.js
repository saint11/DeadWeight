const fs = require('fs');
const path = require('path');

// Minimal replacement for express.static, only meant for local previewing
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
};

function serveStatic(root) {
    root = path.resolve(root);

    return (req, res) => {
        let urlPath;
        try {
            urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        } catch (e) {
            res.writeHead(400).end('Bad request');
            return;
        }

        let filePath = path.join(root, urlPath);
        if (filePath !== root && !filePath.startsWith(root + path.sep)) {
            res.writeHead(403).end('Forbidden');
            return;
        }

        fs.stat(filePath, (err, stats) => {
            if (!err && stats.isDirectory()) {
                if (!urlPath.endsWith('/')) {
                    res.writeHead(301, { Location: urlPath + '/' }).end();
                    return;
                }
                filePath = path.join(filePath, 'index.html');
            }

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
                    return;
                }
                const type = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': type });
                res.end(req.method === 'HEAD' ? undefined : content);
            });
        });
    };
}

module.exports = { serveStatic };
