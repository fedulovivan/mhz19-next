this is next interation

hardware part is implemented on top of esp8266 with nodemcu and connected to network with MQTT protocol
server mqtt.js is connected to broker to get access to data.
received values a stored into coachdb
client web application is written on react and connects with server over websockets

![ui screen](https://raw.githubusercontent.com/fedulovivan/mhz19-next/master/Screenshot%202019-12-14%20at%2023.51.46.png)

mqtt clienl lua code is located at - https://github.com/fedulovivan/interstellar/tree/master/nodemcu/mqtt.lua
