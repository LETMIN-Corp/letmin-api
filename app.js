const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();

app.get("/", (req, res) => {
    res.send({
        message: "Hello World!"
    });
})

app.listen(port, () => {
    console.log("Server running at http://localhost:"+port+"/");
})
