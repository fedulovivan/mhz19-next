
### PENDING
- finish implementation of poweroff button
- discover and fix yeelight devices reconnection problem
- try golang on server side (!)
- try graphql

### DONE
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