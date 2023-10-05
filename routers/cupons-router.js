const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser'); // Importe o body-parser
const mysql2 = require('mysql2');
const db = require('../db');
const cupomController = require('../controllers/cupomController');
const loginController = require('../controllers/loginController');

// Configuração do body-parser no roteador de cupons
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/cupons', loginController.verificarAutenticacao, (req, res) => {
    cupomController.buscarCupons()
        .then((cupons) => {
            for (const cupom of cupons) {
                cupom.data_cadastro = formatarData(cupom.data_cadastro);
                cupom.data_fim = formatarData(cupom.data_fim);
            }
            res.render('cupom/cupom', { cupons });
        })
        .catch((error) => {
            console.error('Erro ao buscar formulários:', error);
        });
});

router.get('/verificar/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    console.log(codigo);
    cupomController.verificarCupom(codigo, req,res)
        .then((cupom) => {            
            
        })
        .catch((error) => {
            console.error('Erro ao buscar cupom:', error);
        });
});

function formatarData(data) {
    const dataObj = new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

router.post('/cupons/:codigo/:acao', async (req, res) => {
    const codigo = req.params.codigo;
    const acao = req.params.acao === 'ativar' ? true : false;
  
    try {
      const cupomAtualizado = await cupomController.ativarDesativarCupom(codigo, acao);
   
      res.json(cupomAtualizado);
    } catch (error) {
      res.status(404).json(error);
    }
});

router.post('/cad-cupom', async (req, res) =>{
    
    const novoCupom = {
        codigo: req.body.codigo,
        quantidade: req.body.quantidade,
        data_fim: req.body.dataFim,
        situacao: 'Ativo', 
        desconto: req.body.desconto,
        restante: 1,
    };

    console.log(novoCupom);
    cupomController.cadastrarCupom(novoCupom)
    .then((cupomCadastrado) => {
      console.log('Cupom cadastrado com sucesso:', cupomCadastrado);
    })
    .catch((error) => {
      console.error('Erro ao cadastrar o cupom:', error);
    });
});

router.get('/cad-cupom', loginController.verificarAutenticacao, (req, res) => {
    res.render('cupom/cad-cupom');        
});

router.get('/editar/:codigo', async (req, res) => {
    const codigo = req.params.codigo;
    
    let cupom  = await  cupomController.buscarCuponsCodigo(codigo);
    console.log(cupom);

    res.render('cupom/edt-cupom', { cupom }); // Renderize a página de edição com os dados do cupom
});

router.post('/editar', async (req, res) => {
    const codigo = req.params.codigo;

    const cupomAtualizado = {
        codigo: req.body.codigo,
        quantidade: req.body.quantidade,
        data_fim: req.body.dataFim,
        desconto: req.body.desconto,
    };

    console.log(req.body);

    try {
        
        const resultado = await cupomController.atualizarCupom(req.body.codigo, cupomAtualizado);
        
        if (resultado) {
            console.log('Cupom atualizado com sucesso:', resultado);
            res.redirect('/cupons'); 
        } else {
            res.status(404).send('Cupom não encontrado');
        }
    } catch (error) {
        console.error('Erro ao atualizar o cupom:', error);
        res.status(500).send('Erro ao atualizar o cupom');
    }
});

module.exports = router;