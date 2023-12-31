const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const db = require('../db');
const relatoriosController = require('../controllers/relatorioController');
const loginController = require('../controllers/loginController');

router.get('/inscricoes_aprovadas', loginController.verificarAutenticacao,(req, res) => {
    relatoriosController.buscarInscricoesAprovadas()
        .then((inscricoes) => {      
            for (const inscricao of inscricoes) {
                if(inscricao.situacao_pagamento === 'approved'){
                    inscricao.situacao_pagamento = 'Pagamento aprovado'
                }
                console.log(inscricao);
            }      
            
            // console.log(inscricoes);
            res.render('relatorios/inscricoes-aprovadas', { inscricoes });
        })
        .catch((error) => {
            console.error('Erro ao buscar formulários:', error);
        });
});
module.exports = router;
