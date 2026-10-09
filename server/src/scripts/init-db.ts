import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function initDatabase() {
  // Conectamos primero a la base por defecto 'postgres' para verificar si existe nuestra base
  const adminPool = new Pool({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: "postgres",
  });

  const targetDb = process.env.DB_NAME || "mascota_virtual_db";

  try {
    console.log("🔍 Verificando conexión con el servicio PostgreSQL...");
    const testResult = await adminPool.query("SELECT version();");
    console.log("✅ Conexión establecida con éxito:", testResult.rows[0].version.split(",")[0]);

    const checkDb = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDb]
    );

    if (checkDb.rows.length === 0) {
      console.log(`📦 Creando la base de datos '${targetDb}'...`);
      await adminPool.query(`CREATE DATABASE ${targetDb};`);
      console.log(`🎉 Base de datos '${targetDb}' creada exitosamente.`);
    } else {
      console.log(`ℹ️ La base de datos '${targetDb}' ya existe.`);
    }
  } catch (error) {
    console.error("❌ Error al inicializar la base de datos:", error);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

initDatabase();
