export enum OutputAction {
    PostSonoffSwitchMessage = 'PostSonoffSwitchMessage',
    YeelightDeviceSetPower = 'YeelightDeviceSetPower',
    Zigbee2MqttSetState = 'Zigbee2MqttSetState',
    ValveSetState = 'ValveSetState',
    TelegramBotMessage = 'TelegramBotMessage',
}

export enum PayloadConditionFunction {
    Equal = 'Equal',
    InList = 'InList',
    Changed = 'Changed',
    NotNil = 'NotNil',
}

export enum OutputLayerAdapter {
    Mqtt = 'Mqtt',
    Sonoff = 'Sonoff',
    Yeelight = 'Yeelight',
    Telegram = 'Telegram',
}