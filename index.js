const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const formularioController = require('./controllers/formularioController');

function integrarPagamentosMP(){
    formularioController.buscarInscricoes()
  .then((inscricoes) => {    
    console.log('Pagamentos integrados com sucesso');
  })
  .catch((error) => {
    console.error('Erro !!! ao integrar os pagamentos!', error);
  })
}

setInterval(integrarPagamentosMP, 60000);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const formularios_router = require('./routers/formularios-router');
const relatorios_router = require('./routers/relatorios-router');
const loginController = require('./controllers/loginController');
const rotas = [ formularios_router, relatorios_router ];

app.use(session({
    secret: '2h$9jL3@9P*F4o1I',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {    
    res.locals.loggedIn = req.session.loggedIn || false;
    next();
});

app.use("/", rotas);

app.listen(21100, () => {
    console.log("Executando na porta 21093");
});
app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/login', async (req, res) => {
    try {
        if (await loginController.buscarUsuarioSenha(req,res) === 'credênciais inválidas') {
          res.redirect("/?login=invalido");           
        } else {
          const usr = await loginController.buscarUsuarioSenha(req,res); 
          req.session.loggedIn = true;
          req.session.username = usr[0].login;        
          res.redirect("/");   
        }               
      } catch (error) {
        console.error(error);
      }
});

app.get('/logout', async (req, res) => {
    try {
        loginController.deslogar(req,res)
      } catch (error) {
        console.error(error);
      }
});

app.get('/', (req, res) => {    
    res.render("index");
});

app.set('view engine', 'ejs');

app.use(express.static('public'));

