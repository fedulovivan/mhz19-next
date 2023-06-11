## After migrating to new disk

- revive duckdns scripts
- install docker and move following services to it
    - zigbee2mqtt
    - mosquitto
    - mhz19-next app
- replace yeelight-platform. is has babel-eslint as non-dev dependency, has no typings

# Back front split

- remove hardcode from ROOT constant
- move everything from src to client
- revive server unit tests
- eliminate writing log to the main.log file
