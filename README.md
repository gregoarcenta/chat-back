# Proyecto de Chat en Tiempo Real

Este proyecto es una aplicación de chat en tiempo real construida con **NestJS**, **Socket.IO** y **React**.
Proporciona funcionalidades esenciales para la gestión de usuarios, salas de chat y envío de mensajes.

## Características

- Registro y desconexión de usuarios.
- Unión y salida de salas.
- Envío y recepción de mensajes en tiempo real.

## Tecnologías Utilizadas

- NestJS
- Socket.IO
- Jest
- TypeScript
- React
- ShadCN

## Endpoints

El backend funciona exclusivamente con WebSockets. Algunos eventos destacados son:

### Eventos Principales

- **user:joined**: Emite cuando un usuario se conecta.
- **user:left**: Emite cuando un usuario abandona la conexión.
- **room:joined**: Emite cuando un usuario se une a una sala.
- **room:left**: Emite cuando un usuario abandona una sala.
- **message:receive**: Emite cuando se recibe un mensaje en una sala o de manera global.

## Instalación

### Backend (NestJS)

1. Clona este repositorio.
2. Navega a la carpeta del backend: `cd backend`.
3. Instala las dependencias: `pnpm install`.
4. Ejecuta el servidor: `pnpm start`.

### Frontend (React)

1. Clona este repositorio.
2. Navega a la carpeta del frontend: `cd frontend`.
3. Instala las dependencias: `pnpm install`.
4. Crea un archivo `.env` en la raiz dentro de la carpeta frontend
5. Modifica el archivo `.env` agregando `VITE_URL=http://localhost:3000`
4. Ejecuta el cliente: `pnpm dev`.

## Pruebas

Este proyecto incluye pruebas unitarias con **Jest**. Navegar a la carpeta del backend: `cd backend` y ejecutar:

```bash
npm run test

