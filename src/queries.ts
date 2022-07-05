import { gql } from '@apollo/client';

export const COMMON_FIELDS_FRAGMENT = gql`
    fragment CommonFields on DeviceMessageUnified {
        device_id
        timestamp
        battery
        linkquality
    }
`;

export const TEMPERATURE_SENSOR_FRAGMENT = gql`
    fragment TemperatureSensor on DeviceMessageUnified {
        temperature
        humidity
        pressure
    }
`;

export const ALL_DEVICE_CUSTOM_ATTRIBUTES_FRAGMENT = gql`
    fragment AllDeviceCustomAttributes on DeviceCustomAttributesMap {
        name
        isHidden
    }
`;

export const GET_STATS = gql`
    query GetStats {
        stats {
            zigbee_devices
            valve_status_messages
            device_messages_unified
            yeelight_devices
            yeelight_device_messages
            sonoff_devices
        }
    }
`;

export const GET_SONOFF_DEVICES = gql`
    ${ALL_DEVICE_CUSTOM_ATTRIBUTES_FRAGMENT}
    query GetSonoffDevices {
        sonoffDevices {
            device_id
            ip
            port
            switch
            customAttributes {
                ...AllDeviceCustomAttributes
            }
        }
    }
`;

export const GET_YEELIGHT_DEVICES = gql`
    ${ALL_DEVICE_CUSTOM_ATTRIBUTES_FRAGMENT}
    query GetYeelightDevices($historyWindowSize: Int) {
        yeelightDevices(historyWindowSize: $historyWindowSize) {
            id
            messages {
                timestamp
            }
            customAttributes {
                ...AllDeviceCustomAttributes
            }
        }
    }
`;

export const GET_LAST_TEMPERATURE_MESSAGE = gql`
    ${TEMPERATURE_SENSOR_FRAGMENT}
    query GetLastTemperatureMessage {
        lastTemperatureMessage {
            timestamp
            ...TemperatureSensor
        }
    }
`;

export const GET_TEMPERATURE_SENSOR_MESSAGES = gql`
    ${TEMPERATURE_SENSOR_FRAGMENT}
    query GetTemperatureSensorMessages($historyWindowSize: Int, $deviceId: String) {
        deviceMessagesUnified(
            historyWindowSize: $historyWindowSize,
            deviceId: $deviceId
        ) {
            timestamp
            ...TemperatureSensor
        }
    }
`;

export const GET_VALVE_STATUS_MESSAGES = gql`
    query GetValveStatusMessages($historyWindowSize: Int) {
        valveStatusMessages(historyWindowSize: $historyWindowSize) {
            timestamp
            time
            leakage
            valve
            hotMeterTicks
            coldMeterTicks
        }
    }
`;

export const GET_ZIGBEE_DEVICES = gql`
    ${COMMON_FIELDS_FRAGMENT}
    ${TEMPERATURE_SENSOR_FRAGMENT}
    ${ALL_DEVICE_CUSTOM_ATTRIBUTES_FRAGMENT}
    query GetZigbeeDevices($historyWindowSize: Int) {
        zigbeeDevices(historyWindowSize: $historyWindowSize) {
            timestamp
            ieee_address
            type
            network_address
            supported
            friendly_name
            definition {
                model
                vendor
                description
            }
            power_source
            date_code
            model_id
            interviewing
            interview_completed
            # description
            # friendly_name
            # last_seen
            # model
            # model_id
            # network_address
            # power_source
            # type
            # vendor
            # voltage
            # battery
            # custom_description
            messages {
                ...CommonFields
                ...TemperatureSensor
            }
            customAttributes {
                ...AllDeviceCustomAttributes
            }
        }
    }
`;
