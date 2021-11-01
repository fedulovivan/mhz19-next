import config from 'config';
import TelegramBot from 'node-telegram-bot-api';

import {
    fetchLastTemperatureSensorMessage,
    insertIntoDeviceCustomAttributes,
    insertIntoValveStatusMessages,
    insertIntoYeelightDevices,
    insertIntoZigbeeDevices,
} from 'src/db';
import mqttClient from 'src/mqttClient';

const bot = new TelegramBot(config.telegram.token, { polling: true });

export const botSendButtons = (chatId: number) => {
    bot.sendMessage(
        chatId,
        "Manage valve state",
        {
            "reply_markup": {
                "keyboard": [[{ text: "/open" }, { text: "/close" }]]
            }
        }
    );
};

bot.onText(/\/start/, (msg) => {
    botSendButtons(msg.chat.id);
});
bot.onText(/\/open/, (msg) => {
    mqttClient.publish(`/VALVE/STATE/SET`, "off");
});
bot.onText(/\/close/, (msg) => {
    mqttClient.publish(`/VALVE/STATE/SET`, "on");
});
bot.onText(/\/temp/, async (msg) => {
    const rows = await fetchLastTemperatureSensorMessage();
    bot.sendMessage(
        msg.chat.id,
        JSON.stringify(rows[0], null, ' '),
    );
});

export default bot;
