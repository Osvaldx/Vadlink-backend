# Vadlink Backend

Backend API desarrollado con NestJS para la plataforma Vadlink, una red social que permite a los usuarios crear posts, comentar, dar likes y gestionar su perfil.

## 🚀 Tecnologías

- **NestJS** (v11.0.1) - Framework principal
- **MongoDB** con **Mongoose** (v8.19.2) - Base de datos
- **TypeScript** (v5.7.3) - Lenguaje de programación
- **JWT** (jsonwebtoken) - Autenticación mediante tokens
- **bcrypt** (v6.0.0) - Encriptación de contraseñas
- **Cloudinary** (v2.8.0) - Almacenamiento de imágenes
- **class-validator** y **class-transformer** - Validación de datos
- **cookie-parser** - Manejo de cookies HTTP

## 📁 Estructura del Proyecto

```
src/
├── app.module.ts              # Módulo principal de la aplicación
├── main.ts                    # Punto de entrada de la aplicación
├── app.controller.ts          # Controlador principal
├── app.service.ts             # Servicio principal
│
├── modules/                   # Módulos de funcionalidad
│   ├── auth/                  # Autenticación y autorización
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/
│   │       └── auth-user-dto.ts
│   │
│   ├── users/                 # Gestión de usuarios
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── posts/                 # Gestión de publicaciones
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   ├── dto/
│   │   │   └── create-post.dto.ts
│   │   └── entities/
│   │       └── post.entity.ts
│   │
│   ├── comments/              # Gestión de comentarios
│   │   ├── comments.controller.ts
│   │   ├── comments.service.ts
│   │   ├── dto/
│   │   │   ├── create-comment.dto.ts
│   │   │   └── update-comment-dto.ts
│   │   └── entities/
│   │       └── comment.entity.ts
│   │
│   └── stats/                 # Estadísticas (solo admin)
│       ├── stats.controller.ts
│       └── stats.service.ts
│
├── guards/                    # Guards de autenticación y autorización
│   ├── jwt/
│   │   └── jwt.guard.ts       # Guard para verificar JWT
│   └── is-admin/
│       └── is-admin.guard.ts  # Guard para verificar rol admin
│
├── middlewares/               # Middlewares personalizados
│   └── logger/
│       └── logger.middleware.ts  # Middleware de logging HTTP
│
├── cloudinary/                # Integración con Cloudinary
│   ├── cloudinary.config.ts
│   ├── cloudinary.module.ts
│   └── cloudinary.service.ts
│
├── common/                    # Utilidades comunes
│   └── utils/
│       └── validate-object-id.ts
│
└── interfaces/                # Interfaces TypeScript
    └── payload-token-format/
        └── payload-token-format.interface.ts
```

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd vadlink-backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (ver sección de Variables de Entorno)

4. Iniciar la aplicación:
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 🔐 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/vadlink

# JWT Secret Key
SECRET_KEY=tu_secret_key_super_segura

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# URLs por defecto para avatares y banners
AVATAR_DEFAULT=https://res.cloudinary.com/...
AVATAR_DEFAULT_ID=default_avatar_id
BANNER_DEFAULT=https://res.cloudinary.com/...
BANNER_DEFAULT_ID=default_banner_id
```

## 📡 API Endpoints

### Autenticación (`/auth`)

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/logout` | Cerrar sesión | JWT |
| POST | `/auth/authorize` | Verificar token | JWT |
| POST | `/auth/refresh` | Refrescar token | JWT |

**Ejemplo de registro:**
```bash
POST /auth/register
Content-Type: multipart/form-data

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "username": "juanperez",
  "email": "juan@example.com",
  "password": "password123",
  "dateofbirth": "1990-01-01",
  "description": "Mi descripción",
  "avatar": <archivo>
}
```

**Ejemplo de login:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

### Usuarios (`/users`)

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/users` | Obtener todos los usuarios | Admin |
| GET | `/users/:id` | Obtener usuario por ID | No |
| POST | `/users` | Crear usuario | Admin |
| PATCH | `/users/:id` | Actualizar usuario | No |
| DELETE | `/users/:id` | Eliminar usuario | No |
| POST | `/users/upload/avatar` | Subir avatar | JWT |
| POST | `/users/disable/:userId` | Deshabilitar usuario | Admin |
| POST | `/users/enable/:userId` | Habilitar usuario | Admin |

### Posts (`/posts`)

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/posts` | Crear nuevo post | JWT |
| GET | `/posts` | Obtener todos los posts | JWT |
| DELETE | `/posts/:id` | Eliminar post | JWT |
| POST | `/posts/like/:id` | Dar like a un post | JWT |
| POST | `/posts/removeLike/:id` | Quitar like de un post | JWT |

**Query Parameters para GET `/posts`:**
- `username`: Filtrar por nombre de usuario
- `date`: Ordenar por fecha (`asc` | `desc`)
- `likes`: Ordenar por likes (`asc` | `desc`)
- `limit`: Límite de resultados
- `offset`: Offset para paginación

**Ejemplo de creación de post:**
```bash
POST /posts
Content-Type: multipart/form-data
Cookie: token=<jwt_token>

{
  "title": "Mi primer post",
  "description": "Descripción del post",
  "file": <archivo_imagen>
}
```

### Comentarios (`/comments`)

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/comments/add/:postId` | Agregar comentario | JWT |
| PUT | `/comments/update/:commentId` | Actualizar comentario | JWT |
| GET | `/comments/:postId` | Obtener comentarios de un post | JWT |

**Query Parameters para GET `/comments/:postId`:**
- `limit`: Límite de resultados
- `offset`: Offset para paginación

**Ejemplo de creación de comentario:**
```bash
POST /comments/add/:postId
Content-Type: application/json
Cookie: token=<jwt_token>

{
  "text": "Este es mi comentario"
}
```

### Estadísticas (`/stats`) - Solo Admin

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/stats/users/posts` | Posts por usuario | Admin |
| GET | `/stats/comments` | Conteo de comentarios | Admin |
| GET | `/stats/posts/comments` | Comentarios por post | Admin |
| GET | `/stats/posts/timeline` | Timeline de posts | Admin |
| GET | `/stats/comments/timeline` | Timeline de comentarios | Admin |
| GET | `/stats/posts/likes` | Estadísticas de likes | Admin |

**Query Parameters para todas las rutas de stats:**
- `from`: Fecha de inicio (formato ISO)
- `to`: Fecha de fin (formato ISO)

## 🗄️ Modelos de Datos

### User
```typescript
{
  _id: ObjectId
  firstName: string (requerido)
  lastName: string (opcional)
  username: string (requerido, único)
  rol: 'user' | 'admin' (default: 'user')
  description: string (opcional)
  dateofbirth: Date (requerido)
  email: string (requerido, único)
  password: string (requerido, encriptado)
  isDisabled: boolean (default: false)
  avatar: string (default: AVATAR_DEFAULT)
  avatar_id: string (default: AVATAR_DEFAULT_ID)
  banner: string (default: BANNER_DEFAULT)
  banner_id: string (default: BANNER_DEFAULT_ID)
  createDate: Date (default: ahora)
}
```

### Post
```typescript
{
  _id: ObjectId
  title: string (requerido)
  description: string (opcional)
  url_img: string (opcional)
  url_img_id: string (opcional)
  likes: number (default: 0)
  shared: number (default: 0)
  user_id: ObjectId (requerido, referencia a User)
  username: string
  likedBy: ObjectId[] (array de referencias a User)
  isDeleted: boolean (default: false)
  created_at: Date (default: ahora)
}
```

### Comment
```typescript
{
  _id: ObjectId
  post_id: ObjectId (requerido, referencia a Post)
  user_id: ObjectId (requerido, referencia a User)
  username: string (requerido)
  firstName: string (requerido)
  lastName: string (opcional)
  text: string (requerido)
  modified: boolean (default: false)
  disabled: boolean (default: false)
  avatar: string (requerido)
  created_at: Date (default: ahora)
}
```

## 🛡️ Guards y Middlewares

### JwtGuard
Verifica la validez del token JWT almacenado en las cookies. Si el token es válido, agrega la información del usuario al objeto `request`.

**Uso:**
```typescript
@UseGuards(JwtGuard)
@Get()
findAll() {
  // El usuario está autenticado
}
```

### IsAdminGuard
Verifica que el usuario tenga el rol de administrador. Extiende la funcionalidad de `JwtGuard`.

**Uso:**
```typescript
@UseGuards(IsAdminGuard)
@Get()
findAll() {
  // Solo usuarios admin pueden acceder
}
```

### LoggerMiddleware
Registra todas las peticiones HTTP con información sobre método, URL, código de estado y tiempo de respuesta.

**Configuración:** Aplicado globalmente a todas las rutas en `app.module.ts`.

## ✅ Buenas Prácticas Implementadas

### 1. Validación de Datos
- Uso de **class-validator** para validar DTOs
- Validación automática mediante `ValidationPipe` global
- Configuración de `forbidNonWhitelisted: true` para rechazar propiedades no definidas
- Transformación automática de tipos

### 2. Seguridad
- Encriptación de contraseñas con **bcrypt**
- Autenticación mediante JWT almacenado en cookies HTTP-only
- Guards para proteger rutas sensibles
- Validación de ObjectIds de MongoDB
- CORS configurado para orígenes específicos

### 3. Estructura Modular
- Separación de responsabilidades por módulos
- DTOs para validación y transformación de datos
- Entidades separadas de la lógica de negocio
- Servicios reutilizables

### 4. Manejo de Archivos
- Integración con Cloudinary para almacenamiento de imágenes
- Optimización automática de imágenes
- Organización en carpetas (avatars, posts)
- Eliminación de imágenes antiguas al actualizar

### 5. Logging
- Middleware de logging para todas las peticiones
- Información detallada: IP, método, URL, status code, tiempo de respuesta

### 6. Configuración
- Variables de entorno para configuración sensible
- ConfigModule global de NestJS
- TypeScript con configuración estricta

### 7. Soft Delete
- Implementación de `isDeleted` en posts para no eliminar físicamente
- Implementación de `isDisabled` en usuarios para deshabilitar sin eliminar

### 8. Paginación
- Soporte para `limit` y `offset` en endpoints de listado
- Mejora el rendimiento en grandes volúmenes de datos

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Inicia en modo desarrollo con hot-reload

# Producción
npm run build             # Compila el proyecto
npm run start:prod        # Inicia en modo producción

# Testing
npm run test              # Ejecuta tests unitarios
npm run test:watch        # Ejecuta tests en modo watch
npm run test:cov          # Ejecuta tests con cobertura
npm run test:e2e          # Ejecuta tests end-to-end

# Calidad de código
npm run lint              # Ejecuta ESLint y corrige errores
npm run format            # Formatea el código con Prettier
```

## 🔄 Flujo de Autenticación

1. **Registro/Login**: El usuario se registra o inicia sesión
2. **Token JWT**: El servidor genera un token JWT y lo almacena en una cookie HTTP-only
3. **Peticiones autenticadas**: El cliente envía automáticamente la cookie en cada petición
4. **Validación**: `JwtGuard` valida el token y extrae la información del usuario
5. **Refresh**: El token puede ser refrescado mediante el endpoint `/auth/refresh`

## 🌐 CORS

La aplicación está configurada para aceptar peticiones desde:
- `https://vadlink-frontend.vercel.app` (producción)
- `http://localhost:4200` (desarrollo)

Las credenciales están habilitadas para permitir el envío de cookies.

## 📝 Notas Adicionales

- El proyecto utiliza **MongoDB** como base de datos NoSQL
- Las imágenes se almacenan en **Cloudinary** para optimización y CDN
- Los tokens JWT se almacenan en cookies HTTP-only para mayor seguridad
- El proyecto sigue la arquitectura modular de NestJS
- TypeScript está configurado con modo estricto para mayor seguridad de tipos

## 👥 Roles de Usuario

- **user**: Usuario estándar con permisos básicos
- **admin**: Administrador con acceso a estadísticas y gestión de usuarios