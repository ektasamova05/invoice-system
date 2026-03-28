require("dotenv").config();

const{ Sequelize } = require("sequelize");

 sequelize =  new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false 
    }
);

// test connection

sequelize.authenticate()
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error("DB connection error:", err));

  module.exports = sequelize;