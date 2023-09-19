const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const formularios_router = require('./routers/formularios-router');
const relatorios_router = require('./routers/relatorios-router');
const rotas = [ formularios_router, relatorios_router ];

app.use(session({
    secret: 'secretpassword', // Substitua por uma chave secreta segura
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use("/", rotas);

app.listen(21093, () => {
    console.log("Executando na porta 21093");
});

app.get('/', (req, res) => {    
    res.render("index");
});

app.set('view engine', 'ejs');

app.use(express.static('public'));

