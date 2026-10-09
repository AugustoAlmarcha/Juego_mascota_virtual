import Fastify from "fastify";
import dotenv from "dotenv";
import { checkDatabaseHealth } from "./db.js";

// 1. CARGA DE CONFIGURACIÓN
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// 2. CREACIÓN DE LA INSTANCIA DE FASTIFY
const app = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

// 3. ENDPOINT DE SALUD COMPLETO (Node + PostgreSQL)
// Ahora verifica tanto que Node esté vivo como que el socket TCP con PostgreSQL funcione.
app.get("/api/health", async (_request, reply) => {
  const dbHealth = await checkDatabaseHealth();

  const isHealthy = dbHealth.connected;
  if (!isHealthy) {
    reply.status(503); // HTTP 503: Service Unavailable si la BD no responde
  }

  return {
    status: isHealthy ? "ok" : "degraded",
    service: "virtual-pet-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbHealth,
  };
});

// 4. ARRANQUE DEL SERVIDOR
const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    app.log.info(`🩺 Endpoint de prueba: http://localhost:${PORT}/api/health`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
