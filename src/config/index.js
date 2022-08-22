require("dotenv").config();

module.exports = {
  DB: process.env.MONGO_URI || "mongodb://root:example@mongo:27017/",
  PORT: process.env.APP_PORT || 5000,
  HOST: '0.0.0.0',
  SECRET: process.env.APP_SECRET,
  CLIENT_URL: process.env.APP_CLIENT_URL,
  CLIENT_ID: process.env.CLIENT_ID,
};
