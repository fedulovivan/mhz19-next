### Home automation server and playground
- typescript 3.7
- react 16
- useSate, useEffect, useReducer hooks
- RPC layer implemented over socket.io
- emotion as styled components library
- parcel with hot reload enabled
- eslint with airbnb presets
- couch db
- mqtt client
- materialui 4
- react-vis charting library
- debug module
- no redux, no create-react-app

### UI screen

![ui screen](https://raw.githubusercontent.com/fedulovivan/mhz19-next/master/images/screen01.png)

### Scripts
- `yarn parcel:dev` - launch parcel in development more with hmr enabled
- `yarn server` - launch backend
- `yarn start` - launch two commands above simultaneusly

### TBD

hardware part is implemented on top of esp8266 with nodemcu and connected to network with MQTT protocol
server mqtt.js is connected to broker to get access to data.
received values a stored into coachdb
client web application is written on react and connects with server over websockets

### MQTT client for ESP8266

mqtt clienl lua code is located at - https://github.com/fedulovivan/interstellar/tree/master/nodemcu/mqtt.lua
