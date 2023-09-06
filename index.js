const express = require('express');
const app = express();
const db = require('./db');
const formularios_router = require('./routers/formularios-router');
const rotas = [ formularios_router ];

app.use("/", rotas);

app.listen(3000, () => {
    console.log("Executando na porta 3000");
});

app.get('/', (req, res) => {    
    res.render("index");
});

app.set('view engine', 'ejs');

