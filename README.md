# 🐾 Mascota Virtual (Virtual Pet Game)

Proyecto de videojuego móvil 2D/2.5D con perspectiva isométrica/oblicua, Y-Sorting, economía transaccional ACID y sistema multijugador cooperativo de **Hogar Compartido (Household)**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación de Ingeniería |
| :--- | :--- | :--- |
| **Cliente Móvil** | **Godot Engine 4 (GDScript)** | Motor 2D nativo ultra liviano, Y-Sorting integrado por hardware, exportación a Android APK. |
| **Backend / API** | **Node.js + TypeScript + Express/Fastify** | Tipado estricto en tiempo de compilación, validación de DTOs con Zod, arquitectura limpia en capas. |
| **Persistencia** | **PostgreSQL (vía Docker)** | Integridad referencial fuerte, transacciones ACID para evitar duplicación de monedas e ítems. |
| **Tiempo Real** | **WebSockets (RFC 6455)** | Sincronización bidireccional de baja latencia sobre TCP para minijuegos y estados de la casa. |

---

## 📂 Estructura del Monorepo

```text
Juegocelular/
├── client/              # Proyecto de Godot Engine 4 (GDScript)
│   ├── assets/          # Sprites, audio, fuentes, texturas
│   ├── scenes/          # Escenas de UI, habitaciones y minijuegos (.tscn)
│   └── scripts/         # Lógica cliente y controladores (.gd)
│
├── server/              # Backend en Node.js + TypeScript
│   ├── src/             # Código fuente (controllers, services, repositories)
│   ├── docker/          # Docker Compose para PostgreSQL local
│   └── tsconfig.json    # Configuración del compilador de TypeScript
│
├── docs/                # Documentación como Código (Docs-as-Code)
│   ├── architecture.md  # Arquitectura de capas y flujos de red
│   └── adr/             # Architecture Decision Records (justificaciones técnicas)
│
└── .gitignore           # Filtro maestro para Godot (.godot/) y Node (node_modules/)
```

---

## 🚀 Metodología y Roadmap

* **Metodología**: Scrum con Sprints de 2 semanas y enfoque pedagógico de ingeniería.
* **Sprint 0**: Cimientos, configuración del entorno, Docker para PostgreSQL y "Bala Trazadora" (Tracer Bullet HTTP).
