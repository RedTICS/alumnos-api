const sql = require('mssql');
const { CONNSQL } = require('./config');

const poolPromise = new sql.ConnectionPool(CONNSQL)
    .connect()
    .then(pool => {
        console.log('✅ Conectado a SQL Server');
        return pool;
    })
    .catch(err => {
        console.log('❌ Error de conexión: ', err);
    });

module.exports = {
    sql, poolPromise
};
