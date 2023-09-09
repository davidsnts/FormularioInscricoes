const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const formularioController = require('../controllers/formularioController');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


router.get('/inscrever', (req, res) => {    

  const db = mysql2.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    port: 3308,
    database: 'geracaoeleita',
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      return;
    }

    db.query('SELECT * FROM formulario', (error, results, fields) => {
      if (error) {
        console.error('Erro ao executar a consulta:', error);
        db.end(); 
        return;
      }

      const formulario = results[0];
      const data_inicio = new Date(formulario.data_inicio);
      const data_fim = new Date(formulario.data_fim);

      const dia_inicio = data_inicio.getDate();
      const mes_inicio = data_inicio.getMonth() + 1;
      const ano_inicio = data_inicio.getFullYear();
      formulario.data_inicio = `${dia_inicio.toString().padStart(2, '0')}/${mes_inicio.toString().padStart(2, '0')}/${ano_inicio}`;

      const dia_fim = data_fim.getDate();
      const mes_fim = data_fim.getMonth() + 1;
      const ano_fim = data_fim.getFullYear();
      formulario.data_fim = `${dia_fim.toString().padStart(2, '0')}/${mes_fim.toString().padStart(2, '0')}/${ano_fim}`;

      // Renderize o modelo após obter os resultados
      res.render('formularios/formulario1', { formulario });

      // Feche a conexão com o banco de dados após concluir todas as operações
      db.end();
    });
  });
});


router.post('/finalizarPagamento', (req, res) => {

  // fazer o insert da inscricao

  let inscritos = []
  inscritos = req.body.inscritos;
  console.log(inscritos);


  const db = mysql2.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    port: 3308,
    database: 'geracaoeleita',
  });

  for (const inscrito of inscritos) {
    db.query(
      'INSERT INTO inscrito (nome, email, telefone, dataNascimento, telefoneResponsavel, nomeResponsavel, bairroCongregacao, telefoneEmergencia, rua, numero, bairro, cidade, estado, lider) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        inscrito.nome,
        inscrito.email,
        inscrito.telefone,
        inscrito.dataNascimento,
        inscrito.telefoneResponsavel,
        inscrito.nomeResponsavel,
        inscrito.bairroCongregacao,
        inscrito.telefoneEmergencia,
        inscrito.rua,
        inscrito.numero,
        inscrito.bairro,
        inscrito.cidade,
        inscrito.estado,
        inscrito.lider,
      ],
      (error, results, fields) => {
        if (error) {
          console.error('Erro ao inserir inscrito:', error);
          return;
        }
        console.log('Inscrito inserido com sucesso:', results.insertId);
      }
    );
  }
  
  
   
 
  produto = {
    quantity: inscritos.length,
    unit_price: 10.55,
    title: 'Convite'
  }

  formularioController(produto);

  res.send('Dados inseridos com sucesso');
});

router.get('/edt-formulario', (req, res) => {
  res.render('formularios/edt-formulario');
});

module.exports = router;
