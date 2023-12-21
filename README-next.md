### Start containers stack

use `docker-compose up` to start everything in docker mosquitto + zigbee2mqtt + backend + client

## Start components manually

- switch to node 18 with `sudo n 18`
- cd to `/Users/ivanf/Desktop/Projects/zigbee2mqtt` and run zigbee2mqtt with `npm start` 
- run mosquitto in docker with `docker-compose up`

## After reinstalling ubuntu on macmini

- install docker and move following services to it: zigbee2mqtt, mosquitto, mhz19-next
- revive duckdns scripts

## DB part

- lwb trunk right before sqlite elimination: rev 58894 (removed in 58895,58896) at /Users/ivanf/Desktop/Projects/branches/trunk/frontend
- use sequilize to work with sqlite db
- tables
  - devices 
    - id
    - name
    - json
  - messages
    - device_id
    - timestamp
    - json

## Back front split

- replace yeelight-platform. is has babel-eslint as non-dev dependency, has no typings
- need to find better place for images/networkmap.svg
- remove hardcode from ROOT constant
- move everything from src to client
- revive server unit tests
- eliminate writing log to the main.log file, use stdout
- compile everything with ts

## trying colima (not sure its reasonable to go with it)

install with `brew install colima`
start with `colima start --arch aarch64 --vm-type=vz --vz-rosetta`
check list of colima instances `colima list`
enter colima instance shell `colima ssh`
deploy as ususal `docker-compose up`

## USB in "docker on mac" is not possible

- https://github.com/docker/for-mac/issues/900
- https://github.com/docker/for-mac/issues/5263, https://github.com/docker/for-mac/issues/6771
- https://github.com/rancher-sandbox/rancher-desktop
- try colima or rancher-desktop
- https://www.zigbee2mqtt.io/guide/installation/02_docker.html
- https://www.zigbee2mqtt.io/guide/configuration/adapter-settings.html#configuration-of-the-zigbee-adapter
- https://gist.github.com/citruz/9896cd6fb63288ac95f81716756cb9aa
- colima > qemu > libusb
