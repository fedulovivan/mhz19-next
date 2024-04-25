
### 0 Priority
- (+) implement throttle
- (+) get rid of babel, switch to pure typescript
- (+) fix update on ubuntu, install required docker and docker compose
- (+) commit changes to repo and move to macmini under docker
- (+) add sanity checks in up.sh
- (+) fix "expected to fetch one device from db"
- tidy debug logs, now same messages are written twice - by logger and by debug module, also the "category" disabled with "mhz19-*,-mhz19-mdns" is not handled by logger, and outputted anyway
- bring mosquitto and zigbee2mqtt back to the compose stack (remove related services, including pm2)
- host optimization - switch to ssd, remove snap
- return back to "bridge" network in container (or try https://www.npmjs.com/package/bonjour-service)
- exclude homepod's ip 192.168.88.66 from sonoff_devices (accidentally treated as sonoff)
- eliminate usage of old tables, eliminate old queries, switch to sequilize
- try kubernetes
- implement "pinger" device as alternative for https://github.com/andrewjfreyer/monitor
- try golang on server side

### 1 Priority Server
- OutputAction.Zigbee2MqttSetState supports only strings in payloadData, so we cannot take any input value as is, if its not string
- remove hardcode: yeelightDeviceSetPower from supportedAdapters works only bedroom ceiling light
- we probably need to handle also non-json messages in zigbee2MqttWildcardHandler, now non-json payloads (which could not be parsed with JSON.parse) are just ignored
- introduce data type field in device_custom_attributes table (?)
- try https://github.com/dotansimha/graphql-code-generator (?)

### 1 Priority Client
- finish implementation of poweroff button (?)
- discover and fix yeelight devices reconnection problem (?)
- indicate on temterature message card, whether shown data is outdated (?)
- find solution for stucked parcel:dev builds (?)

### DONE
- (+) make payloadConditions optional
- (+) fix saving list of zigbee devices in new format
- (+) fix saving network map
- (+) try graphql
- (+) send zigbee2mqtt/bridge/config/devices/get periodically
- (+) LastSeenBar message=undefined figure this out
- (+) show spinner/loader on page first open
- (+) inject debug module into logger calls
- (+) fix yeelight device messages FOREIGN key problem
- (+) rename SaveZigbeeDeviceMessage to SaveZigbeeDeviceMessage
- (+) switch to immer in reducer (also check https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns/#immutable-update-utility-libraries and https://github.com/markerikson/redux-ecosystem-links/blob/master/immutable-data.md#immutable-update-utilities)
- (+) get rid of relative imports
- (+) move sources to src folder, move react code to dedicated folder src/components
- (+) get rid of deviceStates in client state, store this data in zigbeeDevivesMessages
- (+) rename waterSensorRecentMessages to zigbeeDevivesMessages

### Shell commands
other
    systemctl list-unit-files | grep enabled
    apt list --installed | grep -i docker
    dpkg -l | grep -i docker
    neofetch
    sudo ss -tulpn
git
    check for upcoming changes from remote
        git fetch --dry-run
    get current revision
        git rev-parse HEAD
zigbee2mqtt
    vim /opt/zigbee2mqtt/data/log/2024-04-03.11-50-22/log.txt
mosquitto
    vim /var/log/mosquitto/mosquitto.log
    sudo systemctl restart mosquitto
monitor
    sudo systemctl stop monitor
    journalctl -u monitor -f
bluetooth and system info
    hciconfig -a
    hciconfig hci0 up
    dmesg | grep Blue

### DB-related stuff

SELECT json_extract(json, '$.water_leak') as wl, * from device_messages_unified WHERE device_id in ('0x00158d000405811b','0x00158d0004035e3e','0x00158d00040356af') ORDER by "timestamp" DESC 

### Old package.json scripts
"build": "rm -rf dist/ && parcel build --no-cache index.html",
"status": "pm2 list server-entrypoint.js",
"start": "pm2 start server-entrypoint.js",
"restart": "pm2 restart server-entrypoint.js",
"stop": "pm2 stop server-entrypoint.js",
"parcel:dev": "UV_THREADPOOL_SIZE=16 parcel watch index.html --hmr-port 44587 --no-cache",
"server:dev": "DEBUG=\"mhz19-*\" node server-entrypoint.js",
"dev": "concurrently --raw \"yarn parcel:dev\" \"yarn server:dev\"",
"download-schema": "apollo service:download --endpoint=http://192.168.88.188:8888/graphql graphql-schema.json",
"test": "DEBUG=mhz19-automation-engine mocha --recursive --extension 'js,ts,tsx' --require test/prepare.js",
"logs": "tail -f main.log"
