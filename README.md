# Deploy flutter web app with nodejs https server 
---

## Intro
- We have:
	- Flutter Web app build
	- VPS/VDS host (e.g. with ubuntu 20.04 onboard with root access)
- We will:
	- Setup simple https server
	- Deploy web app
	- Server as service
	
## Setup and first launch

### Init working directories

```bash
$ mkdir -p /home/httpsserver/flutter-web 
$ cd /home/httpsserver
```

`Move flutter web build to the "flutter-web" directory`

### Generate a self-signed certificate

run command using terminal and fill answers:

```bash
$ openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

two files should be generated: server.cert (certificate) and server.key (certificate private key)

### Install node and npm

```bash
$ apt install node npm
```

### Init new node project and get modules

```bash
$ npm init
$ npm install express
```

### Create an app.js file

`app.js`

```javascript
const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');

const host = '0.0.0.0';
const port = 8000;

// add path to the flutter web build folder
app.use(express.static(path.join(__dirname, 'flutter-web')));

// handle default route to return app html
app.get("/", function (req, res) {
  res.sendFile('flutter-web/index.html', {root:__dirname});
});

// start server using cert and key
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
```

### Run

exec command to start server

```bash
$ node app.js
```

open your browser and type server address `https://yourserveraddress:8000/`,
trust certificate and you should see a flutter app page

## Autorun

### Make a new unit file

`httpsserver.service`

```txt
[Unit]
Description=Httpsserver Service
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/node app.js
WorkingDirectory=/home/httpsserver/
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Move and start

move unit to the systemd

```bash
$ mv httpsserver.service /etc/systemd/system/
```

reload systemd config

```bash
$ systemctl daemon-reload
```

add service to autorun and launch immediately

```bash
$ systemctl enable httpsserver --now
```

check service status

```bash
$ systemctl status httpsserver
```