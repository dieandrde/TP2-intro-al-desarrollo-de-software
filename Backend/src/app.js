const express = require("express");

const rutas_canchas = require("./api/canchas.routes");

const app = express();

/* middleware, intercepta solicitud analiza json 
*/
app.use(express.json());

app.use("/canchas", rutas_canchas);

app.get("/", (req, res) => {
    res.send("api de canchas funcionando");
});

module.exports = app;