import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

let dbConfig;

if (process.env.NODE_ENV === "development") {
  dbConfig = {
    host: process.env.DEV_DB_HOST,
    user: process.env.DEV_DB_USER,
    port: process.env.DEV_DB_PORT,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
  };
  console.log("🔧 Connecting to the local database (development)...");
} else {
  dbConfig = {
    host: process.env.PROD_DB_HOST,
    port: process.env.PROD_DB_PORT,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
  };
  console.log("🔧 Connecting to the production database...");
}
const dbPool = mysql.createPool(dbConfig);

export default dbPool.promise();
