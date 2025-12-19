# TP2 - Sistema de Reserva de Canchas - FIUBA

## Descripción del Proyecto
Este sistema es una plataforma integral para la gestión y reserva de canchas.

* **Backend:** Construido con Node.js y Express, utilizando PostgreSQL como base de datos.
* **Frontend:** Interfaz dinámica desarrollada en HTML, CSS y JavaScript vainilla, consumiendo la API de forma asincrónica.
* **Infraestructura:** Uso de Docker para la contenerización de la base de datos, garantizando un entorno de desarrollo consistente.

---

## 🛠️ Configuracion y Ejecucion
### 🟢 Levantar el Backend
1. Navegá a la carpeta del servidor:
   ```bash
   cd Backend
2. Levanta del docker compose:
   ```bash
   docker compose up -d
3. Instala las dependencias necesarias:
   ```bash
   npm install
4. Corre el servidor:
   ```bash
   npm run dev
### 🔵 Levantar el Frontend
1. Navega a la carpeta de la interfaz:
   ```bash
   cd Frontend
2. Inicia el servidor:
   ```bash
   npx http-server
3. Abrí tu navegador en la dirección 
   ```bash
   http://localhost:8080
