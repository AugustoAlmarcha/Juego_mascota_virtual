import Fastify from "fastify";
import dotenv from "dotenv";
import { checkDatabaseHealth } from "./db.js";
import { authRoutes } from "./routes/auth.routes.js";

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

// 3. REGISTRO DE MÓDULOS DE RUTAS
// Todas las rutas de autenticación vivirán bajo el prefijo /api/auth
app.register(authRoutes, { prefix: "/api/auth" });

// 4. ENDPOINT DE SALUD (Health Check)
app.get("/api/health", async (_request, reply) => {
  const dbHealth = await checkDatabaseHealth();

  const isHealthy = dbHealth.connected;
  if (!isHealthy) {
    reply.status(503);
  }

  return {
    status: isHealthy ? "ok" : "degraded",
    service: "virtual-pet-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbHealth,
  };
});

// 5. ARRANQUE DEL SERVIDOR
const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    app.log.info(`🩺 Health check: http://localhost:${PORT}/api/health`);
    app.log.info(`🔐 Rutas de auth: http://localhost:${PORT}/api/auth/register`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
