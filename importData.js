const XLSX = require('xlsx');
const path = require('path');
const { poolPromise, sql } = require('./db');
const filePath = path.join(__dirname, 'Cruce_vacunas_kits_escolares.xlsx');

async function importarAlumnos() {
  try {
    const pool = await poolPromise;

    // Leer Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertir a JSON
    const alumnos = XLSX.utils.sheet_to_json(sheet, { raw: false });

    let count = 0;

    for (const alumno of alumnos) {
      // Insertar o actualizar en SQL Server
      await pool.request()
        .input('dni', sql.Int, alumno.DNI)
        .input('apellido_nombres', sql.VarChar(250), alumno.NOMBRE)
        .input('fecha_nacimiento', sql.VarChar(10), alumno.FechaNac)
        .input('nivel', sql.VarChar(50), alumno.Nivel)
        .input('esquema_completo', sql.Bit, alumno.Recaptar.toLowerCase() === 'si' ? 0 : 1)
        .query(`
                    MERGE Alumnos AS target
                    USING (SELECT @dni AS dni) AS source
                    ON target.dni = source.dni
                    WHEN MATCHED THEN
                        UPDATE SET 
                            apellido_nombres = @apellido_nombres,
                            fecha_nacimiento = @fecha_nacimiento,
                            nivel = @nivel,
                            esquema_completo = @esquema_completo
                    WHEN NOT MATCHED THEN
                        INSERT (dni, apellido_nombres, fecha_nacimiento, nivel, esquema_completo)
                        VALUES (@dni, @apellido_nombres, @fecha_nacimiento, @nivel, @esquema_completo);
                `);
      count++;
    }

    console.log(`Importados ${count} alumnos`);
    process.exit(0);

  } catch (err) {
    console.error('Error al importar alumnos:', err);
  }
}

importarAlumnos();
