const mercadopago = require('../mercadopago/mercadopago');
const express = require("express");
const router = express.Router();
const db = require('../db');

function abrirCheckout(produto, req, res) {  
  return mercadopago.obterLinkPagamento(produto.title, produto.unit_price, produto.quantity)
    .then(linkPagamento => {            
      return linkPagamento; // Retorna o link de pagamento
    })
    .catch(error => {
      console.error('Erro ao obter link de pagamento:', error);
      throw error; // Lança o erro para que ele seja tratado posteriormente
    });
}

function buscarInscritos(codInscricao){
    if (codInscricao == 0) {
    
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM inscrito`, (error, results) => {
        if (error) {
          console.error({ error: 'Erro ao consultar o banco de dados.' });
          reject(error);
        }
        resolve(results);
      });
    });
    
  } else {
    
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM inscrito where cod_inscricao = ${codInscricao}`, (error, results) => {
        if (error) {
          console.error({ error: 'Erro ao consultar o banco de dados.' });
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
function buscarInscricoes() {
  mercadopago.buscarPagamentosAprovados()
    .then(async function (pagamentos) {
      for (const pagamento of pagamentos) {
        if (pagamento.inscricao !== null && pagamento.inscricao.includes("#")) {
          const partes = pagamento.inscricao.split('#');
          if (partes.length > 1) {
            const valorAposHashtag = partes[1];
            
            const inscricao = await buscarInscricaoPorCodigo(valorAposHashtag);
                    
            if (inscricao && inscricao.status !== 'approved') {              
              await atualizarStatusInscricao(inscricao.cod_inscricao, 'approved');              
            }
          } else {
            console.log('A string não contém uma hashtag (#).');
          }
        }
      }
    })
    .catch(function (error) {
      console.error(error);
    });

  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM inscricao', (error, results) => {
      if (error) {
        console.error({ error: 'Erro ao consultar o banco de dados.' });
        reject(error);
      }
      resolve(results);
    });
  });
}

// Função para buscar uma inscrição pelo código
async function buscarInscricaoPorCodigo(codigo) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM inscricao WHERE cod_inscricao = ?`, [codigo], (error, results) => {
      if (error) {
        console.error('Erro ao buscar inscrição:', error);
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

async function atualizarStatusInscricao(id, novoStatus) {
  return new Promise((resolve, reject) => {
    db.query('UPDATE inscricao SET situacao_pagamento = ? WHERE cod_inscricao = ?', [novoStatus, id], (error, results) => {
      if (error) {
        console.error('Erro ao atualizar status da inscrição:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function buscarFormularios() {
  return new Promise((resolve, reject) => {
    db.connect((err) => {
      if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        reject(err);
        return;
      }

      db.query('SELECT * FROM formulario', (error, results, fields) => {
        if (error) {
          console.error('Erro ao executar a consulta:', error);
          reject(error);
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
        
        resolve(formulario);
      });
    });
  });
}
async function atualizarFormulario(formulario) {
  try {

    const sql = `
        UPDATE formulario
        SET
          descricao = ?,
          valor = ?,
          data_inicio = ?,
          data_fim = ?
        WHERE cod_formulario = ?
      `;

    const result = await db.execute(sql, [
      formulario.descricao,
      formulario.valor,
      formulario.data_inicio,
      formulario.data_fim,
      formulario.cod_formulario,
    ]);

    console.log('Formulário atualizado com sucesso:');
  } catch (error) {
    console.error('Erro ao atualizar o formulário:', error);
  } finally {

  }
}

async function criarInscricao(req, res) {
  const inscritos = req.body.inscritos;
  const cod_form = inscritos[0].formulario.cod_formulario;
  
  const produto = {
    quantity: inscritos.length,
    unit_price: inscritos[0].formulario.valor,
    title: inscritos[0].formulario.descricao
  }

  try {
    const cod_inscricao = await inserirInscricao(cod_form);
    
    produto.title = produto.title + ' #' + cod_inscricao;

    

    
    

      for (const inscrito of inscritos) {
        db.query(
          'INSERT INTO inscrito (nome, email, telefone, dataNascimento, telefoneResponsavel, nomeResponsavel, bairroCongregacao, telefoneEmergencia, rua, numero, bairro, cidade, estado, lider, cod_inscricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
            cod_inscricao
          ],
          (error, results, fields) => {
            if (error) {
              console.error('Erro ao inserir inscrito:', error);
              return;
            }
            // console.log('Inscrito inserido com sucesso:', results.insertId);
            
          }
        );
      }
     
      try {
        const linkPagamento = await abrirCheckout(produto, req, res);
        
        // console.log(linkPagamento);
        
        db.query(
          'UPDATE inscricao SET link_pagamento = ? WHERE cod_inscricao = ?',
          [linkPagamento.init_point, cod_inscricao],
          (error, results, fields) => {
            if (error) {
              console.error('Erro ao executar a atualização:', error);
              return;
            }            
          }
        );

        return linkPagamento.init_point;
      } catch (error) {
        console.error('Erro ao obter link de pagamento:', error);
      }

      
  
  } catch (error) {
    console.error('Erro ao criar inscrição:', error);
    throw error; // Lança o erro para que ele seja tratado posteriormente
  }
}

function inserirInscricao(cod_form) {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO inscricao (`situacao_pagamento`, `cod_formulario`) VALUES (?, ?)',
      ['Pagamento em processamento', cod_form],
      function (err, results, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(results.insertId);
        }
      }
    );
  });
}

module.exports = { abrirCheckout, buscarFormularios, atualizarFormulario, criarInscricao, buscarInscritos, buscarInscricoes };
