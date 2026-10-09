import Fastify from "fastify";
import dotenv from "dotenv";

// 1. CARGA DE CONFIGURACIÓN
// dotenv lee el archivo .env y carga las variables en process.env
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// 2. CREACIÓN DE LA INSTANCIA DE FASTIFY
// Fastify incluye un logger estructurado de alto rendimiento (Pino) por defecto
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

// 3. ENDPOINT DE SALUD (Health Check)
// En arquitectura de software, este endpoint sirve para que monitores,
// balanceadores de carga o el cliente (Godot) sepan si el servidor está vivo.
app.get("/api/health", async (_request, _reply) => {
  return {
    status: "ok",
    service: "virtual-pet-backend",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
});

// 4. ARRANQUE DEL SERVIDOR (Socket TCP en escucha pasiva)
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
