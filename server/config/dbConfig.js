var mysql = require('mysql');

var connection = mysql.createConnection({
    database: 'tic_tac_toy',
    host: 'localhost',
    user: 'admin',
    password: '123'
});

module.exports = {
    connection
};