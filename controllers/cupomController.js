const db = require('../db');

function buscarCupons(){   
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM cupom`, (error, results) => {
        if (error) {
          console.error({ error: 'Erro ao consultar o banco de dados.' });
          reject(error);
        }
        resolve(results);
      });
    });    
}

async function buscarCuponsCodigo(codigo) {
  
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM cupom WHERE codigo = ?`, [codigo], (error, results) => {
      if (error) {
        console.error('Erro ao buscar inscrição:', error);
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

async function ativarDesativarCupom(codigo, ativar) {
  try {    
    const cupom = await buscarCuponsCodigo(codigo);

    if (!cupom) {
      return { message: 'Cupom não encontrado' };
    }
    
    const novoStatus = ativar ? 'Ativo' : 'Inativo';

       db.query('UPDATE cupom SET situacao = ? WHERE codigo = ?', [novoStatus, codigo], (error, results) => {
      if (error) {
        console.error('Erro ao atualizar status da inscrição:', error);
        throw error;
      }
    });

    return { message: 'Cupom atualizado com sucesso' };
  } catch (error) {
    throw error;
  }
}

async function verificarCupom(codigo,req,res) {
  try {    
    const cupom = await buscarCuponsCodigo(codigo);

    if (!cupom) {
      res.status(404).json({ message: 'Cupom não encontrado' });
    } else if (cupom.data_fim < new Date() || cupom.situacao !== 'Ativo' || cupom.restante <= 0) {
      res.status(403).json({ message: 'Cupom indisponível' });
    } else {
      res.status(200).json(cupom);      
    }
    
  } catch (error) {
    throw error;
  }
}

async function cadastrarCupom(cupom) {
  try {
    const queryString = 'INSERT INTO cupom (codigo, quantidade, data_fim, situacao, desconto, restante) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [cupom.codigo, cupom.quantidade, cupom.data_fim, cupom.situacao, cupom.desconto, cupom.restante];

    const [result] = await db.promise().query(queryString, values);
    return { id: result.insertId, ...cupom };
  } catch (error) {
    throw error;
  }
}

async function subtrairRestanteCupom(codigo) {
  try {    
    const cupom = await buscarCuponsCodigo(codigo);
    if(cupom != undefined && cupom.situacao === 'Ativo'){
      cupom.restante = cupom.restante - 1;

      db.query('UPDATE cupom SET restante = ? WHERE codigo = ?', [cupom.restante, codigo], (error, results) => {
        if (error) {
          console.error('Erro ao atualizar status da inscrição:', error);
          throw error;
        }
      });
  }    
    
  } catch (error) {
    throw error;
  }
}

async function atualizarCupom(codigo, cupomAtualizado) {
  try {
      const cupom = await buscarCuponsCodigo(codigo);
      
      if (cupom !== undefined) {
          const sql = `
              UPDATE cupom
              SET
                  codigo = ?,
                  quantidade = ?,
                  data_fim = ?,
                  desconto = ?
              WHERE
                  codigo = ?
          `;
          
          const params = [
              cupomAtualizado.codigo,
              cupomAtualizado.quantidade,
              cupomAtualizado.data_fim,
              cupomAtualizado.desconto,
              codigo,
          ];

          db.query(sql, params, (error, results) => {
              if (error) {
                  console.error('Erro ao atualizar o cupom:', error);
                  throw error;
              }
          });

          return true; // Indica que a atualização foi iniciada
      } else {
          return false; // Cupom não encontrado ou situação não é 'Ativo'
      }
  } catch (error) {
      throw error;
  }
}

module.exports = { buscarCupons, buscarCuponsCodigo, ativarDesativarCupom, verificarCupom, subtrairRestanteCupom,cadastrarCupom, atualizarCupom };
