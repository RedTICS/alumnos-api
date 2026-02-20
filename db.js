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

const log = async (user, action) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Usuario', sql.VarChar, user)
            .input('Accion', sql.VarChar, action)
            .query(`
                INSERT INTO Registro (Usuario, Accion)
                VALUES (@Usuario, @Accion)
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
