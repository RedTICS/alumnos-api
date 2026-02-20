const express = require('express');
const cors = require('cors');
const { poolPromise, sql } = require('./db');
const { CONFIG, PASSWORDS, SECRET } = require('./config');
const jwt = require('jsonwebtoken');
const verifyToken = require('./auth.js');
const app = express();
const PORT = CONFIG.API_PORT || 3000;

// Permitir requests desde Angular
app.use(cors({
    origin: CONFIG.APP_URL + ':' + CONFIG.APP_PORT,  // origen del frontend
    credentials: true                 // si usás cookies/sesiones
}));

app.use(express.json());

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        if (username === 'consulta' && password === PASSWORDS.passConsulta) {
            const token = jwt.sign({ username, role: 'read' }, SECRET, { expiresIn: '4h' });
            return res.json({ token });
        }
        if (username === 'carga' && password === PASSWORDS.passCarga) {
            const token = jwt.sign({ username, role: 'write' }, SECRET, { expiresIn: '4h' });
            return res.json({ token });
        }
    }
    res.status(401).json({ error: 'Credenciales inválidas' });
});

app.get('/api/alumnos/:dni', verifyToken, async (req, res) => {
    try {
        const { dni } = req.params;
        const dniInt = parseInt(dni, 10);
        if (!Number.isInteger(dniInt)) {
            return res.status(400).json({ error: 'DNI debe ser un número entero' });
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input('dni', sql.Int, dniInt)
            .query('SELECT * FROM Alumnos WHERE DNI = @dni');
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener alumno' });
    }
});

app.put('/api/alumnos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { esquema_completo } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('esquema_completo', sql.Bit, esquema_completo)
            .query(`
                UPDATE Alumnos
                   SET esquema_completo = @esquema_completo
                WHERE id = @id
            `);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar alumno' });
    }
});

app.listen(PORT, () => console.log(`Servidor corriendo en ${CONFIG.API_URL}:${CONFIG.API_PORT}`));
