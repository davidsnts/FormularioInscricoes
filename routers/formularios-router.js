const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const formularioController = require('../controllers/formularioController');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/inscrever', (req, res) => {   
  res.render('formularios/formulario1');
});

router.post('/finalizarPagamento', (req, res) => {
  //salvar os inscritos no banco; 
  // console.log(req.body.inscritos);   
  let inscritos = []
  inscritos = req.body.inscritos;
  console.log(inscritos);

  produto = {
    quantity: inscritos.length,
    unit_price: 10.55,
    title: 'Convite'
  }

  formularioController(produto); 
});

router.get('/edt-formulario', (req, res) => {   
  res.render('formularios/edt-formulario');
});

module.exports = router;
