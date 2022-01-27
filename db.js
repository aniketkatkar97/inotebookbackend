const mongoose = require("mongoose");
require("dotenv").config();
const dbUrl = process.env.DB_CONNECT_URL;

const connectToMongo = () => {
  mongoose
    .connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connectd to mongodb successfully");
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = connectToMongo;
