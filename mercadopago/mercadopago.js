const mercadopago = require('mercadopago');

mercadopago.configure({
  // access_token: 'TEST-4943873414212296-090613-c0dd61498eb845f83613e6ae8ad2e8e8-125345173',
  access_token: 'APP_USR-621401509858145-092721-bcf8689372d9d85ad2aeb849d1f8f421-1488339296',
});

function buscarPagamentosAprovados() {
  return new Promise((resolve, reject) => {
    var filters = {
      range: 'date_created',
      begin_date: 'NOW-1MONTH',
      end_date: 'NOW',
      status: 'approved',
      operation_type: 'regular_payment'
    };

    mercadopago.payment.search({
      qs: filters
    }).then(function (data) {
      const pagamentos = data.body.results;
      let pagamentosFiltrados = [];

      for (const pagamento of pagamentos) {
        let pagamentoFiltrado = {
          inscricao: pagamento.description,
          statusPagamento: pagamento.status
        };
        pagamentosFiltrados.push(pagamentoFiltrado);
      }

      resolve(pagamentosFiltrados);
    }).catch(function (error) {
      reject(error);
    });
  });
}

function obterLinkPagamento(title, preco, quantity) {
  return new Promise((resolve, reject) => {

    preco = parseFloat(preco);
    const preference = {
      items: [
        {
          title: title,
          unit_price: preco,
          currency_id: 'BRL',
          quantity: quantity,
        },
      ],
    };

    mercadopago.preferences.create(preference)
      .then(response => {
        resolve(response.body);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function buscarPagamentos() {
  return new Promise((resolve, reject) => {
    var filters = {
      range: 'date_created',
      begin_date: 'NOW-1MONTH',
      end_date: 'NOW',
      operation_type: 'regular_payment'
    };

    mercadopago.payment.search({
      qs: filters
    }).then(function (data) {
      const pagamentos = data.body.results;
      console.log(pagamentos);
      resolve(pagamentos);
    }).catch(function (error) {
      reject(error);
    });
  });
}

function realizarReembolso(paymentId, valorReembolso) {
  return new Promise((resolve, reject) => {
    const refundData = {
      amount: valorReembolso,
    };

    mercadopago.payment.refund(paymentId, refundData)
      .then(refundResponse => {
        console.log('Reembolso realizado com sucesso:', refundResponse);
        resolve(refundResponse);
      })
      .catch(error => {
        console.log('Erro ao realizar o reembolso:', error);
        reject(error);
      });
  });
}
// const transactionId = '65045392732';
// const valorReembolso = 1;
// realizarReembolso(transactionId, valorReembolso)
//   .then(response => {
//     console.log(response);
//   })
//   .catch(error => {
//     console.log(error);
//   });

module.exports = { obterLinkPagamento, buscarPagamentosAprovados, buscarPagamentos, realizarReembolso };





