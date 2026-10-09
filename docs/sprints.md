# 📋 Bitácora Ágil de Sprints (Scrum Tracking)

**Proyecto**: Mascota Virtual Multijugador (Hogar Compartido)  
**Desarrollador**: Augusto Almarcha Serafini  
**Metodología**: Sprints de 2 semanas con enfoque pedagógico de ingeniería.

---

## 🏁 SPRINT 0: Cimientos y Configuración del Entorno
* **Estado**: **COMPLETADO (DONE)** ✅
* **Objetivo (Sprint Goal)**: Establecer el monorepo, entornos de desarrollo aislados y validar la comunicación end-to-end (Bala Trazadora) a través de todas las capas del sistema.

### Tareas Cumplidas:
* [x] **S0-01**: Inicialización de Git, `.gitignore` maestro y repositorio remoto en GitHub.
* [x] **S0-02**: Scaffolding del Backend en Node.js + TypeScript estricto con Fastify y hot-reload (`tsx`).
* [x] **S0-03**: Conexión con PostgreSQL 18.4 local, creación de la base de datos `mascota_virtual_db` y Connection Pool.
* [x] **S0-04**: Proyecto base de Godot 4 en modo vertical (720x1280) y Bala Trazadora HTTP conectada con éxito.
* [x] **Seguridad**: Refactor CWE-798 eliminando contraseñas por defecto y forzando carga estricta desde `.env`.

---

## 🚀 SPRINT 1: Dominio del Hogar, Mascota Base y Habitación 2.5D
* **Estado**: **EN PROGRESO (IN PROGRESS)** ⏳
* **Objetivo (Sprint Goal)**: Implementar la arquitectura de dominio de Hogares y Mascotas (con soporte multi-hogar y evolución ramificada), autenticación segura y el prototipo jugable de la habitación 2.5D con movimiento táctil (Tap to Move) y Y-Sorting.

### Visual Target (Meta Estética):
El diseño oficial de la habitación se encuentra documentado en:  
`docs/concepts/room_visual_target.jpg` (inspirado en la perspectiva espaciosa de Mundo Gaturro adaptada a formato vertical móvil con estética cálida y acogedora).

### Historias de Usuario (Backlog del Sprint 1):
* [x] **HU-01.1 (Backend)**: Migración SQL 001 con tablas `users`, `households`, `household_members` y `pets`.
* [x] **HU-01.2 (Backend)**: Endpoints `POST /api/auth/register` y `POST /api/auth/login` con validación Zod, hash bcrypt y tokens JWT.
* [ ] **HU-02 (Frontend - Godot)**: Escena de la Habitación 2.5D (`scenes/room.tscn`) con perspectiva oblicua y suelo amplio.
* [ ] **HU-03 (Frontend - Godot)**: Personaje del Espíritu Mágico flotante con partículas, sombrita y algoritmo **Tap to Move**.
* [ ] **HU-04 (Frontend - Godot)**: Algoritmo de profundidad **Y-Sorting** con los primeros muebles (sillón, maceta).
* [ ] **HU-05 (Integración)**: Conectar el flujo de Onboarding / Selección de modo (Solo vs Pareja/Familia).
