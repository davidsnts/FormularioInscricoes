const db = require('../db');

async function buscarUsuarioSenha(req, res) {
  return new Promise((resolve, reject) => {

    const login = req.body.login;
    const senha = req.body.senha;

    if (!login || !senha) {
      reject('Informe o nome de usuário e senha.');
    }

    const query = 'SELECT * FROM usuario WHERE login = ? AND senha = ?';
    db.query(query, [login, senha], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject('Credenciais inválidas.');
      } else {
        resolve(results);
      }
    });
  });
}

function verificarAutenticacao(req, res, next) {
  if (req.session.loggedIn) {    
    next();
  } else {
    res.redirect('/login');
  }
}

function deslogar(req, res) {
  if (req.session.loggedIn) {    
    req.session.destroy(); 
    res.redirect('/'); 
  }
}
module.exports = { buscarUsuarioSenha, verificarAutenticacao, deslogar };

