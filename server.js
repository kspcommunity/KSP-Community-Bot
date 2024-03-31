// Import necessary modules and dependencies
const express = require('express');
const { config } = require('dotenv');
const path = require('path');
const fs = require('fs');
const { log } = require('./utilities/logger');

// Load environment variables from .env file
config();

// Create an Express application
const app = express();

// Set the root directory for HTML files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Define error handling middleware
app.use((err, req, res, next) => {
  // Log the error
  log(`Unhandled error: ${err.message}`, 'error');
  // Send an error response to the client
  res.status(500).send('Internal Server Error');
});

// Define middleware to handle requests for non-existent routes
app.use((req, res, next) => {
  // Log the request for non-existent routes
  log(`404 Not Found - ${req.method} ${req.url}`, 'warn');
  // Send a 404 response to the client
  res.status(404).send('404 Not Found');
});

// Define the port number from environment variables or use a default value
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  log(`Server is running on port ${PORT}`, 'info');
});

// Automatically serve HTML files with specific routes
const serveHTMLFiles = () => {
  fs.readdir(publicPath, (err, files) => {
    if (err) {
      log(`Error reading directory: ${err.message}`, 'error');
      return;
    }

    files.forEach((file) => {
      if (file.endsWith('.html')) {
        let route = `/${file.slice(0, -5)}`;
        if (file === 'index.html') {
          route = '/';
        }
        app.get(route, (req, res) => {
          const filePath = path.join(publicPath, file);
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              log(`Error reading file ${file}: ${err.message}`, 'error');
              res.status(500).send('Internal Server Error');
              return;
            }
            res.send(data);
            log(`Served ${file} automatically at route ${route}`, 'info');
          });
        });
        log(`Route ${route} added for ${file}`, 'info');
      }
    });
  });
};

serveHTMLFiles();
