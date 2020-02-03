PENDING
- rename SaveDeviceStateAction to SaveZigbeeDeviceMessage
- create new ts interface for zigbee2mqtt/bridge/config/devices/get response
- enable indexes in couchdb database
- rework types in src/react/actionTypes.ts combine constants with interfaces
- figure out with ts server performance issues
- try golang on server side

DONE
- switch to immer in reducer (also check https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns/#immutable-update-utility-libraries and https://github.com/markerikson/redux-ecosystem-links/blob/master/immutable-data.md#immutable-update-utilities)
- get rid of relative imports
- move sources to src folder, move react code to dedicated folder src/components
- get rid of deviceStates in client state, store this data in zigbeeDevivesMessages
- rename waterSensorRecentMessages to zigbeeDevivesMessages