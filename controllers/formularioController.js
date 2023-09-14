const mercadopago = require('../mercadopago/mercadopago');
const express = require("express");
const router = express.Router();
const db = require('../db');

function abrirCheckout(produto, req, res) {
  console.log(produto);
  return mercadopago.obterLinkPagamento(produto.title, produto.unit_price, produto.quantity)
    .then(linkPagamento => {
      console.log('Link de pagamento:', linkPagamento);
      return linkPagamento; // Retorna o link de pagamento
    })
    .catch(error => {
      console.error('Erro ao obter link de pagamento:', error);
      throw error; // Lança o erro para que ele seja tratado posteriormente
    });
}

function buscarInscritos(codInscricao){
  console.log(codInscricao);
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

function buscarInscricoes(){
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
            console.log('Inscrito inserido com sucesso:', results.insertId);
            
          }
        );
      }
 
  const linkRecebido = await abrirCheckout(produto, req, res);
    return linkRecebido; 
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
