const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("ValentePro running!s"));
app.listen(process.env.PORT || 5000);
