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

const log = async (user, ip, action) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Usuario', sql.VarChar, user)
            .input('Accion', sql.VarChar, action)
            .input('Ip', sql.VarChar, ip)
            .query(`
                INSERT INTO Registro (Usuario, Accion, Ip)
                VALUES (@Usuario, @Accion, @Ip)
            `);
        return true;
    } catch (err) {
        console.error(err);
        throw new Error('Error al actualizar log: ' + err.message);
    }
};

module.exports = {
    sql, poolPromise, log
};
