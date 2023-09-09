const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: 'TEST-4943873414212296-090613-c0dd61498eb845f83613e6ae8ad2e8e8-125345173',
});

function obterLinkPagamento(title, preco ,quantity ){
  
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
    // obter o link de pagamento
    mercadopago.preferences.create(preference)
      .then(response => {        
        console.log(response.body.init_point);
      })
      .catch(error => {
        console.log(error);
    });
    //return response.body.init_point;
}

module.exports = obterLinkPagamento;

