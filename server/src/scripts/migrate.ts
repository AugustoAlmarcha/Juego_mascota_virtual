import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log("🚀 Iniciando ejecución de migraciones SQL...");
    
    // Leemos el archivo SQL
    const migrationFile = path.join(__dirname, "../migrations/001_initial_schema.sql");
    const sql = fs.readFileSync(migrationFile, "utf-8");

    // Ejecutamos la migración dentro de una transacción
    await client.query("BEGIN;");
    await client.query(sql);
    await client.query("COMMIT;");

    console.log("✅ Migración 001_initial_schema.sql aplicada con éxito.");

    // Consultamos las tablas creadas para verificar
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("📋 Tablas en 'mascota_virtual_db':");
    tablesResult.rows.forEach(row => console.log(`   • ${row.table_name}`));

  } catch (error) {
    await client.query("ROLLBACK;");
    console.error("❌ Error al aplicar la migración:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
