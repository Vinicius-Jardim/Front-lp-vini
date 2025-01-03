const config = {
    API_URL: process.env.REACT_APP_API_URL || 'https://dre-backend-e5etfrc8dranhfd3.spaincentral-01.azurewebsites.net',
    WS_URL: process.env.REACT_APP_WS_URL || 'wss://dre-backend-e5etfrc8dranhfd3.spaincentral-01.azurewebsites.net/ws',
    JWT_SECRET: process.env.REACT_APP_JWT_SECRET || 'your-secret-key'
};

export default config;
