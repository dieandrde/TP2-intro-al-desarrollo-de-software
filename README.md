# TP2 Introducción al Desarrollo de Software - Cátedra Camejo
# Sistema de reserva de canchas deportivas

## Descripción del Proyecto

Este proyecto consiste en un sistema web para la gestión y reserva de canchas deportivas.

permite:

- Registro e inicio de sesión de usuarios
- Visualización de canchas disponibles
- Creación y gestión de reservas
- Panel de administración para:
  - gestión de usuarios
  - creación de canchas
  - edición y eliminacion de canchas
  - visualizacion de reservas

El sistema está desarrollado con:

- **Frontend:** HTML, CSS (Bulma), JavaScript
- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL
- **Contenerización:** Docker + Docker Compose

## arquitectura del sistema

el sistema está compuesto por tres servicios:

- `frontend` → servido con Nginx
- `backend-api` → API REST en Node.js
- `postgres-db` → Base de datos PostgreSQL

Todos los servicios se levantan mediante Docker Compose.

---

## Requisitos previos

Antes de ejecutar el proyecto, asegurarse de tener instalado:

- Docker Desktop
- Docker Compose

Verificar instalación:

```bash
docker --version
docker compose version
```

## instrucciones para configurar y levantar el sistema:

**1. clonar el repositorio:**
```bash
git clone https://github.com/dieandrde/TP2-intro-al-desarrollo-de-software.git
cd TP2-intro-al-desarrollo-de-software
```

**2. levantar los contenedores:**
```bash
docker compose up --build
```   
(con esto nos aseguramos de crear las imagenes, levantar la base de datos, ejecutar seed inicial, iniciar el backend y el frontend con Nginx)

el sistema está compuesto por tres servicios independientes (base de datos, backend y frontend) orquestados mediante Docker Compose.

**3. acceder al sistema:**

frontend:
```code
http://localhost:8081
```

backend:
```code
http://localhost:3000
```

## levantamiento individual de servicios (opcional):
si se desea ejecutar los servicios por separado, Docker Compose permite iniciar únicamente los necesarios.
- Solo base de datos y backend:
```bash
docker compose up db backend
```

- solo frontend:
```bash
docker compose up frontend
```
*nota: el frontend requiere que el backend esté en ejecución para consumir la API correctamente*  

## usuario administrador por defecto:
al iniciar el sistema, se crea automáticamente un usuario administrador:
  - email: proadmin@gmail.com
  - contraseña: admin12345

## 📸 Capturas de Pantalla
### Página principal:
<img width="1920" height="1080" alt="inicio" src="https://github.com/user-attachments/assets/e58927f9-267c-47a2-9c53-83b1ebc3bc2e" />

### Login / registro:
<img width="1920" height="1080" alt="login" src="https://github.com/user-attachments/assets/753ce0c7-ea4d-419b-9545-bfbe3c47a46f" />
<img width="1920" height="1080" alt="registro" src="https://github.com/user-attachments/assets/d7959024-aa93-4ce7-8c7b-61f6b7dbe502" />

### canchas:
<img width="1920" height="1080" alt="canchas" src="https://github.com/user-attachments/assets/0085db04-fc6a-4cae-88c1-7fdf7f462c2f" />

### realizar / editar reserva:
<img width="1920" height="1080" alt="realizar_reserva" src="https://github.com/user-attachments/assets/9fa17b77-db46-49c4-a267-16b2ac0e8ec8" />
<img width="1920" height="1080" alt="editar_reserva" src="https://github.com/user-attachments/assets/46deab77-199b-4dc7-b67f-ad39178671de" />

### panel administración:
<img width="1920" height="1080" alt="gestion_usuarios" src="https://github.com/user-attachments/assets/1a8d5d32-5d66-47e9-b2a8-8f271cba72ac" />
<img width="1920" height="1080" alt="crear_cancha" src="https://github.com/user-attachments/assets/95f7829b-0b92-4c10-9ca2-960a5dad8cb8" />
<img width="1920" height="1080" alt="editar_canchas" src="https://github.com/user-attachments/assets/b75b82a5-9b37-4794-a87f-171653c7e12e" />
<img width="1920" height="1080" alt="gestion_reservas" src="https://github.com/user-attachments/assets/28a4998c-591e-4f1d-a6c0-6d37e0a4e4ee" />




## Funcionalidades implementadas

el sistema permite gestionar el alquiler de canchas deportivas mediante tres componentes principales: usuarios, canchas y reservas. Los usuarios pueden registrarse, iniciar sesión y realizar reservas, mientras que el administrador cuenta con un panel exclusivo para crear, editar y visualizar canchas, además de consultar las reservas realizadas.

cada reserva vincula a un usuario con una cancha en un horario determinado, permitiendo organizar y registrar la disponibilidad del sistema. Las canchas almacenan información relevante como nombre, tipo, ubicación, precio por hora y capacidad.

el backend se encarga de procesar las solicitudes y comunicarse con la base de datos para guardar y recuperar la información. El frontend permite interactuar con el sistema a través de formularios y tablas dinámicas. Todo el proyecto fue organizado para que frontend, backend y base de datos funcionen de manera integrada, pudiendo levantarse fácilmente mediante Docker.

## Detener sistema:

```bash
docker compose down
```




