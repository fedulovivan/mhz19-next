
### PENDING
- finish implementation of poweroff button
- discover and fix yeelight devices reconnection problem
- indicate on temterature message card, whether shown data is outdated
- try golang on server side (!)
- find solution for stucked parcel:dev builds
- try https://github.com/dotansimha/graphql-code-generator
- introduce data type field in device_custom_attributes table
- remove hardcode: yeelightDeviceSetPower from supportedAdapters works only bedroom ceiling light
- make payloadConditions optional
- OutputAction.Zigbee2MqttSetState supports only strings in payloadData, so we cannot take any input value as is, if its not string
- we probably need to handle non-json messages in zigbee2MqttWildcardHandler, non non json are ignored

### DONE
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
- (?) new widget for device messages history

### DB

SELECT *, json_extract(json, '$.water_leak') as wl from device_messages_unified WHERE device_id = '0x00158d00040356af'
and wl = 1 ORDER by "timestamp" DESC 
