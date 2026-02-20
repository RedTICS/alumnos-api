const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'salocal',
    server: 'localhost',   // ejemplo: localhost o IP
    port: 57374,
    database: 'Alumnos',
    options: {
        // trustedConnection: true,
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
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
