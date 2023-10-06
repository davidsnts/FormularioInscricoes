const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const db = require('../db');
const formularioController = require('../controllers/formularioController');
const loginController = require('../controllers/loginController');

router.get('/inscrever', (req, res) => {
  formularioController.buscarFormularios()
    .then((formulario) => {
      res.render('formularios/formulario1', { formulario });
    })
    .catch((error) => {
      console.error('Erro ao buscar formulários:', error);
    });
});

router.post('/pagar', async (req, res) => {
  try {
    const linkPagamento = req.query.link;
    res.render('formularios/pagar', { linkPagamento });
  } catch (error) {
    console.error('Erro ao gerar link de pagamento:', error);
    res.status(500).json({ error: 'Erro ao finalizar pagamento' });
  }
});
router.post('/finalizarPagamento', async (req, res) => {
  try {
    console.log(req.body);
    const linkRecebido = await formularioController.criarInscricao(req, res);  
    res.json({ linkPagamento: linkRecebido });
  } catch (error) {
    console.error('Erro ao finalizar pagamento:', error);
    res.status(500).json({ error: 'Erro ao finalizar pagamento' });
  }
});
router.get('/inscritos',loginController.verificarAutenticacao, async(req,res) =>{
  const codInscricao = req.query.cod_inscricao;
  
  formularioController.buscarInscritos(codInscricao)
  .then((inscritos) => {
    for (const inscrito of inscritos) {      
        const data_nasc = new Date(inscrito.dataNascimento);
        const dia_inicio = data_nasc.getDate();
        const mes_inicio = data_nasc.getMonth() + 1;
        const ano_inicio = data_nasc.getFullYear();
        inscrito.dataNascimento = `${dia_inicio.toString().padStart(2, '0')}/${mes_inicio.toString().padStart(2, '0')}/${ano_inicio}`;
        inscrito.genero = (inscrito.genero === 'M') ? 'Masculino' : 'Feminino';
        inscrito.complemento = (inscrito.complemento === null) ? 'Não informado' : inscrito.complemento;        
    }
    res.render('formularios/inscritos', { inscritos })
  })
  .catch((error) => {
    console.error('Erro ao buscar inscritos:', error);
  })
})

router.get('/inscricoes',loginController.verificarAutenticacao, async(req,res) =>{
  formularioController.buscarInscricoes()
  .then((inscricoes) => {   
    Object.keys(inscricoes).forEach((codInscricao)=> {
      if (inscricoes[codInscricao][0].situacao_pagamento === 'approved') {
        inscricoes[codInscricao][0].situacao_pagamento = 'Pagamento Aprovado'
      }
    })
    
    res.render('formularios/inscricoes', { inscricoes })
  })
  .catch((error) => {
    console.error('Erro ao buscar inscritos:', error);
  })
});

router.get('/edt-formulario',loginController.verificarAutenticacao, (req, res) => {
  formularioController.buscarFormularios()
    .then((formulario) => {
      formulario.data_inicio = formatarDataParaInputDate(formulario.data_inicio);
      formulario.data_fim = formatarDataParaInputDate(formulario.data_fim);
      res.render('formularios/edt-formulario', { formulario });
    })
    .catch((error) => {
      console.error('Erro ao buscar formulários:', error);
    });
});

function formatarDataParaInputDate(dataString) {
  const partesData = dataString.split('/');
  if (partesData.length === 3) {
    const dia = partesData[0];
    const mes = partesData[1];
    const ano = partesData[2];
    const dataFormatada = `${ano}-${mes}-${dia}`;
    return dataFormatada;
  }
  return dataString;
}

router.post('/atualizarFormulario',loginController.verificarAutenticacao, (req, res) => {
  let formulario = {}
  formulario.descricao = req.body.descricao;
  formulario.valor = req.body.valor;
  formulario.data_inicio = req.body.data_inicio;
  formulario.data_fim = req.body.data_fim;
  formulario.cod_formulario = req.body.cod_formulario;
  formularioController.atualizarFormulario(formulario);
  res.send('Dados alterados com sucesso!');
});

module.exports = router;
