const mercadopago = require('../mercadopago/mercadopago');
const cupomController = require('../controllers/cupomController');
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

function buscarInscritos(codInscricao) {
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
    db.query('SELECT ic.cod_inscricao, situacao_pagamento, i.nome, link_pagamento, desconto, total_pagar FROM inscricao ic left join inscrito i on i.cod_inscricao = ic.cod_inscricao;', (error, results) => {
      if (error) {
        console.error({ error: 'Erro ao consultar o banco de dados.' });
        reject(error);
      }
      const inscricoes = {};


      for (const inscricao of results) {
        const codInscricao = inscricao.cod_inscricao;

        if (!inscricoes[codInscricao]) {
          inscricoes[codInscricao] = [];
        }

        inscricoes[codInscricao].push({
          situacao_pagamento: inscricao.situacao_pagamento,
          link_pagamento: inscricao.link_pagamento,
          nome: inscricao.nome,
          desconto: inscricao.desconto,
          pagar: inscricao.total_pagar
        });
      }

      resolve(inscricoes);
    });
  });
}

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

async function deletarInscricao(id) {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        console.error('Erro ao iniciar a transação:', err);
        reject(err);
        return;
      }     
      db.query('DELETE FROM inscrito WHERE cod_inscricao = ?', [id], (error1) => {
        if (error1) {
          console.error('Erro ao excluir inscrito:', error1);
          db.rollback(() => {
            reject(error1);
          });
          return;
        }        
        db.query('DELETE FROM inscricao WHERE cod_inscricao = ?', [id], (error2) => {
          if (error2) {
            console.error('Erro ao excluir inscrição:', error2);
            db.rollback(() => {
              reject(error2);
            });
            return;
          }          
          db.commit((commitError) => {
            if (commitError) {
              console.error('Erro ao cometer a transação:', commitError);
              db.rollback(() => {
                reject(commitError);
              });
            } else {
              resolve();
            }
          });
        });
      });
    });
  });
}


async function aprovarInscricao(id) {
  const novoStatus = 'approved';
  const desconto = 'DescontoTotal';
  return new Promise((resolve, reject) => {
    db.query('UPDATE inscricao SET situacao_pagamento = ?, link_pagamento = ? WHERE cod_inscricao = ?', [novoStatus, desconto, id], (error, results) => {
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


function converterStringParaData(dataString) {
  const [dia, mes, ano] = dataString.split('/').map(Number);
  return new Date(ano, mes - 1, dia);
}


async function criarInscricao(req, res) {
  const inscritos = req.body.inscritos;
  const cod_form = inscritos[0].formulario.cod_formulario;
  let cupom, produto, descontoTotal;
  descontoTotal = false;

  if (req.body.cupom != undefined) {
    cupom = req.body.cupom;
    cupomController.subtrairRestanteCupom(cupom.codigo);

    const precoTotal = (inscritos[0].formulario.valor * inscritos.length) - cupom.desconto;
    console.log(precoTotal);
    if (precoTotal <= 0) {
      descontoTotal = true;
    }
    produto = {
      quantity: 1,
      unit_price: precoTotal,
      title: inscritos[0].formulario.descricao + `Desconto de R$ ${cupom.desconto}`
    }
  } else {
    produto = {
      quantity: inscritos.length,
      unit_price: inscritos[0].formulario.valor,
      title: inscritos[0].formulario.descricao
    }
  }

  try {
    let cod_inscricao;
    if (descontoTotal) {
      cod_inscricao = await inserirInscricao(cod_form, descontoTotal);
    } else {
      cod_inscricao = await inserirInscricao(cod_form, descontoTotal);
    }
    

    produto.title = produto.title + ' #' + cod_inscricao;

    for (const inscrito of inscritos) {
      let data_nasc = converterStringParaData(inscrito.dataNascimento);
      db.query(
        'INSERT INTO inscrito (nome, email, telefone, dataNascimento, telefoneResponsavel, nomeResponsavel, bairroCongregacao, telefoneEmergencia, rua, numero, bairro, cidade, estado, lider, cod_inscricao, complemento, genero) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          inscrito.nome,
          inscrito.email,
          inscrito.telefone,
          data_nasc,
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
          cod_inscricao,
          inscrito.complemento,
          inscrito.genero
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
      let linkPagamento
      if (descontoTotal) {
        linkPagamento = 'DescontoTotal';
      } else {
        linkPagamento = await abrirCheckout(produto, req, res);
      }

      // console.log(linkPagamento);
      if (req.body.cupom != undefined & !descontoTotal) {
        const valorpagar = parseFloat((inscritos[0].formulario.valor * inscritos.length) - cupom.desconto);
        console.log(valorpagar);
        db.query(
          'UPDATE inscricao SET link_pagamento = ?, desconto = ?, total_pagar = ? WHERE cod_inscricao = ?',
          [linkPagamento.init_point, req.body.cupom.desconto, parseFloat(valorpagar), cod_inscricao],
          (error, results, fields) => {
            if (error) {
              console.error('Erro ao executar a atualização:', error);
              return;
            }
          }
        );
        return linkPagamento.init_point;
      }else if(descontoTotal){
        const valorpagar = 0;
        console.log(valorpagar);
        db.query(
          'UPDATE inscricao SET link_pagamento = ?, desconto = ?, total_pagar = ? WHERE cod_inscricao = ?',
          [linkPagamento, req.body.cupom.desconto, parseFloat(valorpagar), cod_inscricao],
          (error, results, fields) => {
            if (error) {
              console.error('Erro ao executar a atualização:', error);
              return;
            }
          }
        );
        return linkPagamento;
      }
      else {
        db.query(
          'UPDATE inscricao SET link_pagamento = ?, total_pagar = ? WHERE cod_inscricao = ?',
          [linkPagamento.init_point, (parseFloat(produto.unit_price) * parseFloat(produto.quantity)), cod_inscricao],
          (error, results, fields) => {
            if (error) {
              console.error('Erro ao executar a atualização:', error);
              return;
            }
          }
        );
        return linkPagamento.init_point;
      }


      
    } catch (error) {
      console.error('Erro ao obter link de pagamento:', error);
    }



  } catch (error) {
    console.error('Erro ao criar inscrição:', error);
    throw error; // Lança o erro para que ele seja tratado posteriormente
  }
}

function inserirInscricao(cod_form, descontoTotal) {
  if (descontoTotal) {
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO inscricao (`situacao_pagamento`, `cod_formulario`) VALUES (?, ?)',
        ['approved', cod_form],
        function (err, results, fields) {
          if (err) {
            reject(err);
          } else {
            resolve(results.insertId);
          }
        }
      );
    });
  } else {
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO inscricao (`situacao_pagamento`, `cod_formulario`) VALUES (?, ?)',
        ['Pagamento pendente', cod_form],
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
}

module.exports = { abrirCheckout, buscarFormularios, atualizarFormulario, criarInscricao, buscarInscritos, buscarInscricoes, deletarInscricao, aprovarInscricao };
