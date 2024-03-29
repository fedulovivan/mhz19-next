import config from 'config';
import TelegramBot from 'node-telegram-bot-api';

import { KITCHEN_VALVES_MANIPULATOR, TOILET_VALVES_MANIPULATOR } from 'src/constants';
import { fetchLastTemperatureSensorMessage } from 'src/db';
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
    mqttClient.publish(`/VALVE/${KITCHEN_VALVES_MANIPULATOR}/STATE/SET`, "open");
    mqttClient.publish(`/VALVE/${TOILET_VALVES_MANIPULATOR}/STATE/SET`, "open");
});
bot.onText(/\/close/, (msg) => {
    mqttClient.publish(`/VALVE/${KITCHEN_VALVES_MANIPULATOR}/STATE/SET`, "close");
    mqttClient.publish(`/VALVE/${TOILET_VALVES_MANIPULATOR}/STATE/SET`, "close");
});
bot.onText(/\/temp/, async (msg) => {
    const rows = await fetchLastTemperatureSensorMessage();
    bot.sendMessage(
        msg.chat.id,
        JSON.stringify(rows[0], null, ' '),
    );
});

export default bot;
