const mercadopago = require('../mercadopago/mercadopago');

function abrirCheckout(produto){
     mercadopago(produto.title, produto.unit_price, produto.quantity);
}

module.exports = abrirCheckout;
