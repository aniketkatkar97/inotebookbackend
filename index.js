const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

connectToMongo();
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json()); //middleware allows us to send req.body

// Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port || 5001, () => {
  console.log(`iNotebook app listening at http://localhost:${port}`);
});

// "start": "nodemon -r dotenv/config index.js",
