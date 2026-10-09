import { FastifyInstance, FastifyPluginOptions } from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";

const JWT_SECRET: string = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  throw new Error("❌ SEGURIDAD: JWT_SECRET no está definido en el archivo .env");
}

export async function authRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  
  // ==========================================================================
  // 1. REGISTRO DE USUARIO: POST /api/auth/register
  // ==========================================================================
  app.post("/register", async (request, reply) => {
    // PASO 1: ADUANA DE SEGURIDAD (Validación con Zod)
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Los datos enviados no son válidos",
        details: parseResult.error.format(),
      });
    }

    const { username, email, password } = parseResult.data;

    // PASO 2: CRIPTOGRAFÍA (Hashing seguro con bcrypt - 10 rondas de salt)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // PASO 3: TRANSACCIÓN ACID (Todo o Nada en PostgreSQL)
    const client = await pool.connect();
    try {
      await client.query("BEGIN;");

      // 3.1. Verificar si ya existe el email o el username
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1 OR username = $2;",
        [email, username]
      );
      if (existingUser.rows.length > 0) {
        await client.query("ROLLBACK;");
        return reply.status(409).send({
          error: "USER_ALREADY_EXISTS",
          message: "El correo electrónico o nombre de usuario ya está registrado",
        });
      }

      // 3.2. Crear el Usuario
      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, created_at;`,
        [username, email, passwordHash]
      );
      const newUser = userResult.rows[0];

      // 3.3. Generar código de invitación aleatorio (ej: HOGAR-F3A9)
      const randomCode = crypto.randomBytes(3).toString("hex").toUpperCase();
      const inviteCode = `HOGAR-${randomCode}`;

      // 3.4. Crear el Hogar inicial con 100 monedas de bienvenida
      const householdResult = await client.query(
        `INSERT INTO households (name, invite_code, coins)
         VALUES ($1, $2, 100)
         RETURNING id, name, invite_code, coins;`,
        [`Hogar de ${username}`, inviteCode]
      );
      const newHousehold = householdResult.rows[0];

      // 3.5. Vincular al usuario como Dueño (owner) del Hogar
      await client.query(
        `INSERT INTO household_members (user_id, household_id, role)
         VALUES ($1, $2, 'owner');`,
        [newUser.id, newHousehold.id]
      );

      // 3.6. Crear la Mascota inicial (Pochi el Panda)
      const petResult = await client.query(
        `INSERT INTO pets (household_id, name, species)
         VALUES ($1, 'Pochi', 'panda')
         RETURNING id, name, species, hunger, happiness, energy;`,
        [newHousehold.id]
      );
      const newPet = petResult.rows[0];

      // 3.7. Confirmar la transacción atómica
      await client.query("COMMIT;");

      // PASO 4: EMITIR TOKEN JWT (Credencial digital firmada)
      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return reply.status(201).send({
        status: "success",
        message: "¡Registro exitoso! Hogar y mascota creados.",
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
        household: newHousehold,
        pet: newPet,
      });

    } catch (error) {
      await client.query("ROLLBACK;");
      request.log.error(error);
      return reply.status(500).send({
        error: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error inesperado al registrar el usuario",
      });
    } finally {
      // Devolver la conexión al pool
      client.release();
    }
  });

  // ==========================================================================
  // 2. INICIO DE SESIÓN: POST /api/auth/login
  // ==========================================================================
  app.post("/login", async (request, reply) => {
    // 1. Aduana
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Formato de credenciales inválido",
      });
    }

    const { email, password } = parseResult.data;

    // 2. Buscar usuario con consulta parametrizada
    const userQuery = await pool.query(
      `SELECT id, username, email, password_hash FROM users WHERE email = $1;`,
      [email]
    );

    if (userQuery.rows.length === 0) {
      return reply.status(401).send({
        error: "INVALID_CREDENTIALS",
        message: "Correo o contraseña incorrectos",
      });
    }

    const user = userQuery.rows[0];

    // 3. Comparar hash de bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return reply.status(401).send({
        error: "INVALID_CREDENTIALS",
        message: "Correo o contraseña incorrectos",
      });
    }

    // 4. Buscar sus hogares asociados (¡Soporte Multi-Hogar nativo!)
    const householdsQuery = await pool.query(
      `SELECT h.id, h.name, h.invite_code, h.coins, hm.role
       FROM households h
       JOIN household_members hm ON h.id = hm.household_id
       WHERE hm.user_id = $1;`,
      [user.id]
    );

    // 5. Emitir nuevo Token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return reply.send({
      status: "success",
      message: "¡Inicio de sesión exitoso!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      households: householdsQuery.rows,
    });
  });
}
