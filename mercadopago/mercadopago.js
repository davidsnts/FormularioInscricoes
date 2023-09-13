const mercadopago = require('mercadopago');

mercadopago.configure({
    // access_token: 'TEST-4943873414212296-090613-c0dd61498eb845f83613e6ae8ad2e8e8-125345173',
    access_token:'APP_USR-4943873414212296-090613-4500c6599f0367509531f955c54e7d84-125345173',
});

function obterLinkPagamento(title, preco, quantity) {
  return new Promise((resolve, reject) => {
   
    preco = parseFloat(preco);
    const preference = {
      items: [
        {
          title: title,
          unit_price:  preco,
          currency_id: 'BRL',
          quantity: quantity,
        },
      ],
    };    

    mercadopago.preferences.create(preference)
      .then(response => {
        resolve(response.body.init_point);
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = { obterLinkPagamento };



