
### 0 Priority

- in build.sh automatically generate mosquitto.passwd from .env value MQTT_PASSWORD
- Store mappings in DB or as yaml/json file. do not use "code", primary challenge is functions used for "payloadData"
- Suppress docker warning "pull access denied for device-pinger"
- remove redundant props from .env file, since most of them are internal for docker stack
- avoid adressing mosquitto via localhost, use service name
- ensure we do not need "persistance" for mosquitto - https://pagefault.blog/2020/02/05/how-to-set-up-persistent-storage-for-mosquitto-mqtt-broker/
- check its ok to have anonymous volumes created by mosquitto - https://github.com/eclipse/mosquitto/issues/2147
- logger: when some "category" disabled with "mhz19-*,-mhz19-mdns" syntax this is not handled by logger, and outputted anyway

### macmini hw and host optimization

installed packages and made changes
    main page (nginx)
        TODO run nginx on 80 with home page
        `sudo ln -s /home/ivanf/Projects/macmini-home/index.html /var/www/html/index.html`
        info to show external IP
            - 93.157.254.176
            - openspeed test link
            - cockpit link
            - portainer link
            - mhz19-next links
            - zigbee2mqtt link
    list all installed packages
        `zcat /var/log/apt/history.log.*.gz | cat - /var/log/apt/history.log | grep -Po '^Commandline:(?= apt(-get)?)(?=.* install ) \K.*'`
            apt install lm-sensors
            apt install mbpfan
            apt install mc
            apt-get install docker-ce=5:24.0.9-1~ubuntu.20.04~focal docker-ce-cli=5:24.0.9-1~ubuntu.20.04~focal containerd.io **docker**-buildx-plugin docker-compose-plugin
            apt install -y wireguard
            apt install speedtest-cli
            apt install screenfetch
            apt install make
            apt install glances
            apt install sysbench
            apt install apcupsd
            apt-get install cockpit
            apt install sysstat
            apt-get install iotop
    install docker 24
        https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository
    enable docker registry mirror from google
        cat /etc/docker/daemon.json
        {"registry-mirrors":["https://mirror.gcr.io"]}
    install portainer and dozzle
        copleted
    ubuntu ssh disable login screen in cli
        https://ubuntushell.com/disable-ssh-welcome-message/
        `sudo vim /etc/pam.d/sshd`
        `sudo systemctl restart ssh`
    attach ups
        TODO
    handle power off with power button
        TODO
    enable auto power on
        TODO
        https://smackerelofopinion.blogspot.com/2011/09/mac-mini-rebooting-tweaks-setpci-s-01f0.html
        `sudo lspci -vvvxxx | grep "LPC Bridge`
        `sudo setpci -s 00:03.0 0xa4.b=0`
        `sudo setpci -s 0:1f.0 0xa4.b=0`
    to check temperature sensors data
        `sudo apt install lm-sensors`
    daemon to control fan speed
        `sudo apt install mbpfan` 
        `cat /etc/mbpfan.conf`
    other
        `sudo apt install speedtest-cli`
        `sudo apt install mc`   
        `findmnt`
    mount lvm volume from old ubuntu disk
        https://www.cyberciti.biz/faq/linux-mount-an-lvm-volume-partition-command
        https://askubuntu.com/questions/358589/fstab-mount-new-lvg
        `mkdir -p /media/foo`
        `sudo mount /dev/ubuntu-vg/ubuntu-lv /media/foo`
    install wireguard server
        completed, see ~/Desktop/Wireguard
    ups-related stuff
        TODO take data from Notes
    cockpit (webmin simple? alternative)
        TODO

### `sudo lspci -vvvxxx | grep "LPC Bridge`
```txt
00:03.0 ISA bridge: NVIDIA Corporation MCP89 LPC Bridge (rev a2)
        Subsystem: Apple Inc. MCP89 LPC Bridge
        Control: I/O+ Mem+ BusMaster+ SpecCycle+ MemWINV- VGASnoop- ParErr- Stepping- SERR- FastB2B- DisINTx-
        Status: Cap- 66MHz+ UDF- FastB2B+ ParErr- DEVSEL=fast >TAbort- <TAbort- <MAbort- >SERR- <PERR- INTx-
        Latency: 0
        Region 0: I/O ports at 2100 [size=256]
00: de 10 80 0d 0f 00 a0 00 a2 00 01 06 00 00 80 00
10: 01 21 00 00 00 00 00 00 00 00 00 00 00 00 00 00
20: 00 00 00 00 00 00 00 00 00 00 00 00 6b 10 89 cb
30: 00 00 00 00 00 00 00 00 00 00 00 00 ff 00 00 00
40: 6b 10 89 cb 00 00 d0 fe 00 00 00 00 00 00 00 00
50: 00 00 00 00 00 5a 62 02 00 00 00 05 ff 0b 3c 01
60: 00 00 00 00 00 00 00 00 00 00 00 00 18 01 01 00
70: 50 00 ff ff 4d 04 17 00 00 04 44 60 00 00 00 00
80: 00 00 00 ff 00 00 00 00 00 00 40 07 ff 00 00 00
90: 00 7c 00 00 ff ff 0f 00 00 00 00 00 00 00 00 00
a0: 03 00 00 31 00 00 01 00 00 03 1f 03 00 07 ff 07
b0: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
c0: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
d0: fd 00 00 00 00 00 00 00 f8 0c 00 fc 00 73 00 30
e0: 83 74 0b 29 ac 39 af 5a 09 00 c0 5c 00 00 00 00
f0: e8 02 00 fc fd 00 00 00 10 00 80 80 00 00 00 00
```

### DB-related stuff

SELECT json_extract(json, '$.water_leak') as wl, * from device_messages_unified WHERE device_id in ('0x00158d000405811b','0x00158d0004035e3e','0x00158d00040356af') ORDER by "timestamp" DESC 

new tables:
    devices
    messages
    device_custom_attributes

old tables:
    yeelight_devices
    yeelight_device_messages
    zigbee_devices
    zigbee_devices_v2
    valve_status_messages
    device_messages_unified
    device_custom_attributes
    sonoff_devices
    temperature_sensor_messages

used methods:
    createOrUpdateDeviceCustomAttribute rest
    createOrUpdateSonoffDevice server
    createOrUpdateZigbeeDevice server
    fetchDeviceCustomAttributes server, rest
    fetchDeviceMessagesUnified rest
    fetchSonoffDevices,
    fetchStats
    fetchValveStatusMessages
    fetchYeelightDeviceMessages
    fetchYeelightDevices
    fetchZigbeeDevicesV2
    insertIntoDeviceMessagesUnified
    insertIntoValveStatusMessages

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
- (+) return back to "bridge" network in container (or try https://www.npmjs.com/package/bonjour-service), without using "host" network mqtt clients are oblidged to use docker ip instead of host ip to connect to broker
- try kubernetes
- (+) Reason for 'IPHONE_15_PRO_IP: 14:40:49 is undefined' - we record also data from */rsp topic as a device message
- (+) implement throttle
- (+) get rid of babel, switch to pure typescript
- (+) fix update on ubuntu, install required docker and docker compose
- (+) commit changes to repo and move to macmini under docker
- (+) add sanity checks in up.sh
- (+) fix "expected to fetch one device from db"
- (+) tidy debug logs, now same messages are written twice - by logger and by debug module
- (+) eliminate usage of old tables, eliminate old queries, switch to sequilize
- (+) extract some code from utils to separate modules
- (+) exclude homepod's ip 192.168.88.66 from sonoff_devices (accidentally treated as sonoff)
- (+) /play-alert is missing mpg123 binary
- (+) /play-alert error: Can't open default sound device! - fixed with mapping for /dev/snd:/dev/snd in docker-compose
- (+) bring mosquitto and zigbee2mqtt back to the compose stack (remove related services, including pm2)
- (+) macmini hw and host optimization - switch to ssd
- (+) check how new stack is going online after host restart
- (+) implement "pinger" device as alternative for https://github.com/andrewjfreyer/monitor
- (+) try golang on server side
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
system
    list of services
        systemctl list-unit-files | grep enabled
    list of docker packages
        apt list --installed | grep -i docker
        dpkg -l | grep -i docker
    listened ports
        sudo ss -tulpn
    general information
        neofetch
git
    check for upcoming changes from remote
        git fetch --dry-run
    get current revision
        git rev-parse HEAD
zigbee2mqtt
    sudo systemctl status zigbee2mqtt.service
    vim /opt/zigbee2mqtt/data/configuration.yaml
    vim /opt/zigbee2mqtt/data/log/2024-04-03.11-50-22/log.txt
mosquitto
    sudo systemctl status mosquitto
    vim /etc/mosquitto/conf.d/default.conf
    vim /var/log/mosquitto/mosquitto.log
monitor
    sudo systemctl stop monitor
    journalctl -u monitor -f
bluetooth and system info
    hciconfig -a
    hciconfig hci0 up
    dmesg | grep Blue

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
