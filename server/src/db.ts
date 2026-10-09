import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// ============================================================================
// SEGURIDAD DÍA 0: VALIDACIÓN DE CREDENCIALES (Fail Fast)
// ============================================================================
// NUNCA hardcodear contraseñas en el código fuente.
// La contraseña debe provenir obligatoriamente de process.env (.env local).
const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) {
  throw new Error("❌ SEGURIDAD: La variable DB_PASSWORD es obligatoria y no está definida en el entorno (.env).");
}

// ============================================================================
// CONNECTION POOL (Pool de Conexiones TCP a PostgreSQL)
// ============================================================================
export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: dbPassword, // 🔒 Protegido: valor tomado exclusivamente del .env
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "mascota_virtual_db",
  max: 10,                      // Máximo 10 conexiones concurrentes simultáneas
  idleTimeoutMillis: 30000,     // Libera conexiones inactivas tras 30 segundos
  connectionTimeoutMillis: 2000  // Falla rápido si la BD no responde en 2 segundos
});

// Helper de diagnóstico para verificar que la BD responde
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const result = await pool.query("SELECT version();");
    return {
      connected: true,
      version: result.rows[0].version.split(",")[0],
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
