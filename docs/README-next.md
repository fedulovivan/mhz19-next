### Start containers stack

use `docker-compose up` to start everything in docker mosquitto + zigbee2mqtt + backend + client

## Start components manually

- switch to node 18 with `sudo n 18`
- cd to `/Users/ivanf/Desktop/Projects/zigbee2mqtt` and run zigbee2mqtt with `npm start` 
- run mosquitto in docker with `docker-compose up`
- store mappings in db, create api for editing, validate rule before saving
- add ui to filter mappings by src and dst devices
- prevent cration duplicated mapping rules
- get rid off babel on server, use pure tsc
- do not store device ids in hardcoded constants, mapping rule shoul use refs from db tables
- use sequilize and migrations to create/populate tables
- add time of day condition function
- use vite on client-side
- use prefixes in DEVICE constants with device class (zigbee, wifi, yeelight, valve-box)

## After reinstalling ubuntu on macmini

- install docker and move following tools/services to it: 
  - mpg123
  - zigbee2mqtt, 
  - mosquitto, 
  - mhz19-next
  - revive duckdns scripts
  - wireguard server

## DB part

- tip: take code from lwb trunk right before sqlite elimination: rev 58894 (removed in 58895,58896) at /Users/ivanf/Desktop/Projects/branches/trunk/frontend
  
- use sequilize to work with sqlite db
- tables
  - mappings
    - id
    - json (?) - not sure plain json is ok, since we need foreign key constants for used device ids
    - enabled
    - description
  - devices 
    - id
    - name
    - json
  - messages
    - device_id
    - timestamp
    - json

## Back front split

- move server/automation-engine/types.ts to lib/typings/
- replace yeelight-platform due to:
  - babel-eslint as non-dev dependency
  - problems with devices Discovery
  - no typings
- need to find better place for images/networkmap.svg or create api to read it on client
- revive server unit tests
- eliminate writing log to the main.log file, use stdout
- (+) remove hardcode from ROOT constant
- (+) move everything from src to client
- (+) compile everything with ts

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
