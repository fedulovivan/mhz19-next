declare module 'config' {
    const telegram: {
        token: string;
        chatId: number;
    };
    const mqttBroker: {
        username: string;
        password: string;
        host: string;
        port: number;
    };
}
