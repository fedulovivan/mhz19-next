import config from 'config';
import TelegramBot from 'node-telegram-bot-api';

import { DEVICE } from 'src/constants';
import { fetchLastTemperatureSensorMessage } from 'src/db';
import * as lastDeviceState from 'src/lastDeviceState';
import mqttClient from 'src/mqttClient';
import { actionsExecutor } from 'src/server';
import { uptime } from 'src/utils';

const bot = new TelegramBot(config.telegram.token, { polling: true });

export const sendTelegramMessageTrottled = (message: string) => {
    bot.sendMessage(config.telegram.chatId, message);
}

export const botSendButtons = (chatId: number) => {
    bot.sendMessage(
        chatId,
        "Available actions",
        {
            "reply_markup": {
                "keyboard": [
                    [{ text: "/open" }, { text: "/close" }],
                    [{ text: "/last-messages" }, { text: "/temp" }, { text: "/stats" }],
                    [{ text: "/start" }]
                ]
            }
        }
    );
};

bot.onText(/\/stats/, async (msg) => {
    const uptimeData = await uptime();
    const actionsExecutorStats = actionsExecutor.getStats();
    const result = {
        actionsExecutor: actionsExecutorStats,
        uptime: uptimeData,
    };
    bot.sendMessage(
        msg.chat.id,
        JSON.stringify(result, null, ' '),
    );
});
bot.onText(/\/start/, (msg) => {
    botSendButtons(msg.chat.id);
});
bot.onText(/\/open/, (msg) => {
    mqttClient.publish(`/VALVE/${DEVICE.KITCHEN_VALVES_MANIPULATOR}/STATE/SET`, "open");
    mqttClient.publish(`/VALVE/${DEVICE.TOILET_VALVES_MANIPULATOR}/STATE/SET`, "open");
});
bot.onText(/\/close/, (msg) => {
    mqttClient.publish(`/VALVE/${DEVICE.KITCHEN_VALVES_MANIPULATOR}/STATE/SET`, "close");
    mqttClient.publish(`/VALVE/${DEVICE.TOILET_VALVES_MANIPULATOR}/STATE/SET`, "close");
});
bot.onText(/\/last-messages/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        JSON.stringify(lastDeviceState.toJSON(), null, ' '),
    ) 
});
bot.onText(/\/temp/, async (msg) => {
    bot.sendMessage(
        msg.chat.id,
        JSON.stringify(lastDeviceState.getOne(DEVICE.TEMPERATURE_SENSOR) ?? 'No one message yet received', null, ' '),
    );
});

export default bot;
