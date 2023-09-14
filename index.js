const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const formularios_router = require('./routers/formularios-router');
const rotas = [ formularios_router ];

app.use("/", rotas);

app.listen(21093, () => {
    console.log("Executando na porta 3000");
});

app.get('/', (req, res) => {    
    res.render("index");
});

app.set('view engine', 'ejs');

app.use(express.static('public'));

