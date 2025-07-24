const http = require("http");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Muat variabel lingkungan dari .env
dotenv.config();

const PORT = process.env.FRONTEND_PORT || 5000;
const API_BASE_URL = process.env.API_BASE_URL;
const PUSHER_APP_KEY = process.env.PUSHER_APP_KEY;
const PUSHER_CLUSTER = process.env.PUSHER_CLUSTER;

const publicDir = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
  let requestUrl = req.url;

  // Handle /config.js request dynamically
  if (requestUrl === "/config.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(`
            const API_BASE_URL = '${API_BASE_URL}';
            const PUSHER_APP_KEY = '${PUSHER_APP_KEY}';
            const PUSHER_CLUSTER = '${PUSHER_CLUSTER}';
            window.frontendConfig = {
                API_BASE_URL: API_BASE_URL,
                PUSHER_APP_KEY: PUSHER_APP_KEY,
                PUSHER_CLUSTER: PUSHER_CLUSTER
            };
        `);
    return;
  }

  // Map request URL to file path
  let filePath = path.join(publicDir, requestUrl);

  // If the request is for the root or a directory, serve index.html
  if (
    requestUrl === "/" ||
    !fs.existsSync(filePath) ||
    fs.statSync(filePath).isDirectory()
  ) {
    filePath = path.join(publicDir, "index.html");
  }

  // Determine content type based on file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
  };
  const contentType = mimeTypes[extname] || "application/octet-stream";

  // Read and serve the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        // If the requested file is not found, try serving index.html as a fallback for SPAs
        fs.readFile(
          path.join(publicDir, "index.html"),
          (err, fallbackContent) => {
            if (err) {
              res.writeHead(404, { "Content-Type": "text/html" });
              res.end(
                "<h1>404 Not Found</h1><p>And index.html fallback also failed.</p>"
              );
            } else {
              res.writeHead(200, { "Content-Type": "text/html" });
              res.end(fallbackContent, "utf-8");
            }
          }
        );
      } else {
        res.writeHead(500);
        res.end(
          "Sorry, check with the site admin for error: " + error.code + " ..\n"
        );
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
  console.log(`Backend API Base URL: ${API_BASE_URL}`);
});
