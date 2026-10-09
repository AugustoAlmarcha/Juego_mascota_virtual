# 🏛️ Documento de Arquitectura de Software

**Proyecto**: Mascota Virtual Multijugador  
**Autor**: Augusto Almarcha Serafini & Tech Lead Mentor  
**Estado**: Sprint 0 - Cimientos

---

## 1. Visión General del Sistema (System Overview)

El sistema sigue un modelo **Cliente-Servidor Autoritativo** (*Authoritative Server Pattern*). El cliente (Godot 4) solo renderiza la interfaz y envía intenciones de usuario; el servidor (Node.js/TypeScript) valida todas las reglas de negocio, la economía y el estado del mundo para evitar trampas y desincronizaciones.

```
       ┌────────────────────────────────────────────────────────┐
       │              CLIENTE MÓVIL (Godot Engine 4)             │
       │   - Y-Sorting 2.5D (Renderizado y Profundidad)         │
       │   - Input Controller ("Tap to Move")                   │
       │   - Cliente HTTP (Requests) & Cliente WebSocket        │
       └───────────────────────────┬────────────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
    (Capa 7: HTTP REST)                       (Capa 7: WebSockets)
    - Autenticación (JWT)                     - Estado en vivo de la casa
    - Tienda & Transacciones                  - Minijuegos cooperativos
    - Sincronización de perfil                - Sincronización de caricias/movimiento
              │                                         │
              └────────────────────┬────────────────────┘
                                   │
       ┌───────────────────────────▼────────────────────────────┐
       │             SERVIDOR BACKEND (Node.js + TS)            │
       │   - Rutas & Controladores (Entrada HTTP/WS)            │
       │   - Middleware de Validación (DTOs con Zod)            │
       │   - Capa de Servicios (Lógica del Dominio / Hogar)     │
       │   - Capa de Persistencia (Repositories / SQL Seguro)   │
       └───────────────────────────┬────────────────────────────┘
                                   │  (Pool de Conexiones TCP)
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             BASE DE DATOS (PostgreSQL 16)              │
       │   - Esquema Relacional Normalizado                     │
       │   - Transacciones ACID (Aislamiento SERIALIZABLE/R-C)  │
       │   - Foreign Keys & Restricciones de Integridad         │
       └────────────────────────────────────────────────────────┘
```

---

## 2. El Modelo de Redes (Mapeo al Modelo TCP/IP)

Como estamos aplicando conceptos de **Redes de Computadoras**, el flujo de comunicación se estructura así:

| Capa | Protocolo / Tecnología | Función en el Juego |
| :--- | :--- | :--- |
| **Capa 7 (Aplicación)** | **HTTP/1.1 y HTTP/2** | Comunicación tipo *Request-Response* para operaciones no continuas (Login, compra en tienda). |
| **Capa 7 (Aplicación)** | **WebSocket (RFC 6455)** | Conexión bidireccional *Full-Duplex* sobre un único socket TCP para eventos en tiempo real. |
| **Capa 4 (Transporte)** | **TCP** | Garantiza entrega en orden y libre de errores (retransmisión con ACK/SYN, control de flujo y congestión). Fundamental para que no se pierdan compras ni ítems. |
| **Capa 3 (Red)** | **IP (IPv4 / IPv6)** | Enrutamiento de paquetes entre el cliente (móvil) y el servidor (VPS / Localhost `127.0.0.1`). |

---

## 3. Modelo de Dominio: El Concepto de "Hogar" (Household)

A diferencia de un Tamagotchi clásico donde una mascota pertenece a una sola persona, nuestro dominio desacopla el jugador de la mascota:

```
[Usuario 1 (Mamá/Amigo)] ──┐
                          ├──► [ HOGAR (Household) ] ──► [ Mascota ]
[Usuario 2 (Hijo/Pareja)] ──┘          │
                                       └──► [ Inventario / Muebles ]
```

* **Household**: Entidad raíz de agregación. Contiene el balance de monedas, la casa y la mascota.
* **Caretakers (Cuidadores)**: Usuarios con credenciales independientes vinculados al mismo `household_id`.
* **Regla de Aislamiento**: Cada consulta en el backend debe validar que el `user` pertenezca al `household` que intenta modificar.

---

## 4. Garantías ACID en la Economía

Para evitar que dos jugadores gasten las mismas monedas simultáneamente (condición de carrera / *Race Condition*):
* Toda compra en la tienda se ejecuta dentro de una transacción:
  $$\text{BEGIN TRANSACTION} \rightarrow \text{SELECT FOR UPDATE (Bloqueo pesimista)} \rightarrow \text{UPDATE / INSERT} \rightarrow \text{COMMIT}$$
* Si falla cualquier paso (ej. fondos insuficientes), se ejecuta un `ROLLBACK` automático.
