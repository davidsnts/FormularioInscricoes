// const mercadopago = require('../mercadopago/mercadopago');
const XLSX = require("xlsx");
const express = require("express");
const router = express.Router();
const db = require('../db');

function buscarInscricoesAprovadas() {
  return new Promise((resolve, reject) => {
    db.query(`select ii.cod_inscricao as inscricao, nome, email, telefone, dataNascimento, telefoneResponsavel, nomeResponsavel, bairroCongregacao, telefoneEmergencia, rua, numero, bairro, cidade, estado, lider, situacao_pagamento, link_pagamento, genero, complemento from inscrito i inner join inscricao ii on i.cod_inscricao = ii.cod_inscricao where ii.situacao_pagamento = 'approved'`, (error, results) => {
      if (error) {
        console.error({ error: 'Erro ao consultar o banco de dados.' });
        reject(error);
      }
      resolve(results);
    });
  });
}

function buscarFormulariosPorCod(cod_formulario) {
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


module.exports = { buscarInscricoesAprovadas };
