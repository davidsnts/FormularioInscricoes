const mysql2 = require('mysql2');

// const db = mysql2.createConnection({
//     host: 'mysql.davidsantos.kinghost.net',
//     user: 'davidsantos',
//     password: '101522mg',
//     port: 3306,
//     database: 'davidsantos',
// });

const db = mysql2.createConnection({
    host: 'mysql.geracaoeleita.kinghost.net',
    user: 'geracaoeleita',
    password: 'ge2023jf',
    port: 3306,
    database: 'geracaoeleita',
});

// try {
//     db.connect();
//     db.end();
// } catch (error) {
//     console.error('Erro ao conectar ao MySQL:', error);
// }

module.exports = db;




