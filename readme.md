# DEV Notes and documentation

## Installation PI

### Install Firmware

- install raspbian buster lite (32 bit)
- expand filesystem: <http://www.orangepi.org/orangepibbsen/forum.php?mod=viewthread&tid=844>
- update
- install git
- download repo
- (try without first: `install npm install -g node-gyp`)
- install node version 14: `curl -sSL https://deb.nodesource.com/setup_14.x | sudo bash - && sudo apt install -y nodejs`

- create file `sudo nano /lib/systemd/system/faderwing.service`
- paste systemd config to file (faderwing.service)

## Troubbleshooting

### libnode.so.64: cannot open shared object file: No such file or directory

> Run `npm clean-install`

## Notes

- display: <https://www.npmjs.com/package/sh1106-js>
- parse correct values
- clean up index.js stuff
- implement ADC
- row switcher
- put stuff from hardcode into config

command:
sudo nodemon -x npm start
