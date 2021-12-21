const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');

const host = '0.0.0.0';
const port = 8000;

// add path to your flutter web build folder
app.use(express.static(path.join(__dirname, 'flutter-web')));

// handle default route to return app html
app.get("/", function (req, res) {
  res.sendFile('flutter-web/index.html', {root:__dirname});
});

// launch server using cert and key
https
  .createServer(
    {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert'),
    },
    app
  )
  .listen(port, host, function () {
    console.log(`Server listens https://${host}:${port}`);
  });