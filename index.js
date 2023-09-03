const express = require('express');
const app = express();

app.listen(3000, () => {
    console.log("Executando na porta 3000");
});

app.get('/', (req, res) => {    
    res.render("index");
});

app.set('view engine', 'ejs');