
# Alarm 3

Install this app, hook up some speakers and use the computer as an alarm clock. Controlled via a web interface.
Created with Node.js.

Alarm sound is taken from http://soundjax.com/alarm-1.html.

## Features

- Built using web sockets. It's fast and propagate events and changes to all clients.
- Verify awake. Press stop and it will prompt if you're awake after 1 minute.
- Detailed log.

## Install

    npm install.


## Usage

    node .

Then access it on `[IP]:1337`. Use [forever](https://github.com/nodejitsu/forever) to keep it alive in the background.