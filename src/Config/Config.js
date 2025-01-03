const config = {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws',
    JWT_SECRET: process.env.REACT_APP_JWT_SECRET || 'your-secret-key'
};

export default config;
