require('./node_modules/dotenv').config({ path: '../.env' });

const pgClient = require('./node_modules/pg');
const database = new pgClient.Client(
  `postgres://${process.env.DB_USER}:` +
  `${process.env.DB_PASSWORD}@` +
  `${process.env.DB_SERVER}:${process.env.DB_PORT}/` +
  `${process.env.DB_NAME}`
);
database.connect();
module.exports = { database: database };