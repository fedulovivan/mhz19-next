PENDING
- create new ts interface for zigbee2mqtt/bridge/config/devices/get response
- enable indexes in database
- switch to immutable.js or immer in reducer (also check https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns/#immutable-update-utility-libraries and https://github.com/markerikson/redux-ecosystem-links/blob/master/immutable-data.md#immutable-update-utilities)

DONE
- get rid of relative imports
- move sources to src folder, move react code to dedicated folder src/components
- get rid of deviceStates in client state, store this data in zigbeeDevivesMessages
- rename waterSensorRecentMessages to zigbeeDevivesMessages