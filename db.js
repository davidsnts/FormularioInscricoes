const mysql2 = require('mysql2');

const db = mysql2.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    port: 3308,
    database: 'geracaoeleita',
});

try {
    db.connect();
    db.end();
} catch (error) {
    console.error('Erro ao conectar ao MySQL:', error);
}

module.exports = db;




