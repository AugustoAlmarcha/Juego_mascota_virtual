import { z } from "zod";

// ============================================================================
// ESQUEMAS DE VALIDACIÓN CON ZOD (Regla de Seguridad: Control de Aduana)
// ============================================================================
// Cualquier dato que llegue del cliente (Godot) DEBE cumplir estas reglas
// antes de que el servidor lo procese o lo mande a la base de datos.

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede exceder 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, números y guiones bajos"),
  email: z
    .string()
    .email("El formato del correo electrónico no es válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña es demasiado larga"),
});

// Inferimos el tipo de TypeScript automáticamente desde el esquema de Zod
export type RegisterDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginDTO = z.infer<typeof loginSchema>;
