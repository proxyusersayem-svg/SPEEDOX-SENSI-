/**
 * Native Node.js Static File Server
 * 
 * Serves the AI Trading Dashboard with correct MIME types
 * and handles modern client-side ES6 modules.
 * 
 * Usage: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Explicit MIME types required to support modern ES6 module loading
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Avoid directory traversal attacks by decoding the URI and sanitizing
    let safeUrl;
    try {
        safeUrl = decodeURIComponent(req.url);
    } catch (e) {
        res.statusCode = 400;
        res.end('Bad Request');
        return;
    }

    // Default home directory mapping
    let filePath = path.join(__dirname, safeUrl === '/' ? 'index.html' : safeUrl);

    // Resolve directory paths safely
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Verify file existence on disk
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Serve basic 404 response
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404 Not Found: The requested resource does not exist.');
            res.end();
            return;
        }

        // Stream static files to conserve memory footprint
        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.on('error', (streamErr) => {
            console.error('Stream read error:', streamErr);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
        });
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `[QuantumAI] Server running successfully.`);
    console.log(`[QuantumAI] Local Terminal: http://localhost:${PORT}`);
    console.log(`[QuantumAI] Press Ctrl+C to terminate the session.`);
});
