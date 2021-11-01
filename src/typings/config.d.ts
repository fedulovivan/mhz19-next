declare module 'config' {
    const app: {
        port: number;
    };
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
