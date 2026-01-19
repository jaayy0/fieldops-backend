# FieldOps Backend

Backend API para la aplicación FieldOps, construido con Node.js, Express y Firebase.

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Tecnologías](#tecnologías)

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
- **npm** (viene incluido con Node.js)
- Una cuenta de **Firebase** con un proyecto creado
- Una cuenta de **OpenAI** con acceso a la API

## Instalación

1. **Clona el repositorio** (o descarga el código fuente):

```bash
git clone <url-del-repositorio>
cd fieldops-backend
```

2. **Instala las dependencias**:

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- `express` - Framework web
- `cors` - Middleware para habilitar CORS
- `dotenv` - Gestión de variables de entorno
- `firebase-admin` - SDK de Firebase Admin
- `openai` - Cliente de OpenAI
- `nodemon` - Herramienta de desarrollo para reinicio automático

## Configuración

### 1. Crear archivo `.env`

Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```env
PORT=8080
OPENAI_API_KEY=tu_clave_api_de_openai_aqui
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

**Variables de entorno:**

- `PORT`: Puerto en el que correrá el servidor (por defecto 8080)
- `OPENAI_API_KEY`: Tu clave API de OpenAI (obtenerla en https://platform.openai.com/api-keys)
- `GOOGLE_APPLICATION_CREDENTIALS`: Ruta al archivo de credenciales de Firebase

### 2. Configurar Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Configuración del proyecto** → **Cuentas de servicio**
4. Haz clic en **Generar nueva clave privada**
5. Se descargará un archivo JSON
6. **Renombra el archivo a `serviceAccountKey.json`**
7. **Coloca el archivo en la raíz del proyecto** (mismo nivel que `package.json`)

> **IMPORTANTE**: Nunca subas el archivo `serviceAccountKey.json` a un repositorio público. Este archivo ya está incluido en `.gitignore`.

### 3. Estructura de archivos requerida

Asegúrate de que tu proyecto tenga esta estructura:

```
fieldops-backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   └── services/
├── .env                      ← Crear este archivo
├── serviceAccountKey.json    ← Agregar este archivo
├── package.json
└── README.md
```

## Ejecución

### Modo Desarrollo

Para ejecutar el servidor en modo desarrollo con reinicio automático:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:8080` (o el puerto que hayas configurado en `.env`)

### Modo Producción

Para ejecutar el servidor en modo producción:

```bash
npm start
```

### Verificar que el servidor está corriendo

Deberías ver un mensaje en la consola:

```
Backend running on port 8080
```

## Estructura del Proyecto

```
fieldops-backend/
├── src/
│   ├── app.js              # Configuración de Express y middleware
│   ├── server.js           # Punto de entrada del servidor
│   ├── config/             # Configuraciones (Firebase, etc.)
│   ├── controllers/        # Lógica de negocio
│   ├── routes/             # Definición de rutas
│   └── services/           # Servicios (Firestore, OpenAI, etc.)
├── .env                    # Variables de entorno (no incluido en git)
├── .gitignore              # Archivos ignorados por git
├── serviceAccountKey.json  # Credenciales de Firebase (no incluido en git)
├── package.json            # Dependencias y scripts
└── README.md               # Este archivo
```

## API Endpoints

El backend expone los siguientes endpoints:

### Incidents (Incidentes)

- `GET /incidents/get-incidents` - Obtener todos los incidentes
- `POST /incidents/create-incident` - Crear un nuevo incidente (con análisis AI)

## Tecnologías

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **Firebase Admin SDK** - Base de datos Firestore
- **OpenAI API** - Análisis de incidentes con IA
- **ES Modules** - Sistema de módulos moderno

## Notas Adicionales

- El proyecto usa **ES Modules** (`"type": "module"` en `package.json`)
- CORS está habilitado para permitir peticiones desde el frontend
- Los incidentes se analizan automáticamente con IA al ser creados
- Todos los datos se almacenan en Firebase Firestore

## Seguridad

- Nunca compartas tu archivo `serviceAccountKey.json`
- Nunca compartas tu `OPENAI_API_KEY`
- Mantén el archivo `.env` fuera del control de versiones
- Revisa el archivo `.gitignore` para asegurar que los archivos sensibles no se suban

## Solución de Problemas

### Error: "Cannot find module"
- Verifica que hayas ejecutado `npm install`
- Asegúrate de que todas las dependencias estén instaladas

### Error: "Firebase Admin SDK initialization failed"
- Verifica que el archivo `serviceAccountKey.json` esté en la raíz del proyecto
- Verifica que la ruta en `.env` sea correcta: `GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json`

### Error: "OpenAI API key not found"
- Verifica que hayas configurado `OPENAI_API_KEY` en el archivo `.env`
- Asegúrate de que la clave API sea válida

### El servidor no inicia
- Verifica que el puerto 8080 no esté siendo usado por otra aplicación
- Cambia el puerto en el archivo `.env` si es necesario

## Decisiones y Supuestos

### Decisiones Técnicas

1. **Base de datos: Firebase Firestore**
   - **Por qué:** Firestore es una base de datos NoSQL serverless que escala automáticamente y no requiere gestión de infraestructura
   - **Alternativas consideradas:** MongoDB Atlas, PostgreSQL
   - **Justificación:** Para un MVP, Firestore ofrece configuración rápida, SDK robusto, y costos bajos en etapas iniciales

2. **Framework: Express.js**
   - **Por qué:** Express es ligero, maduro, y tiene un ecosistema extenso
   - **Alternativas consideradas:** Fastify, NestJS
   - **Justificación:** Simplicidad y velocidad de desarrollo para un backend de tamaño pequeño a mediano

3. **Modelo de IA: GPT-4.1-nano**
   - **Por qué:** Es el modelo nano más reciente de OpenAI ($0.075/$0.300 por 1M tokens) con excelente relación costo-calidad
   - **Alternativas consideradas:** GPT-4o-mini, GPT-4, Claude, modelos locales
   - **Justificación:** Balance óptimo entre costo (~$0.00004/incidente) y calidad de análisis, 50% más económico que GPT-4o-mini

4. **Procesamiento de IA: Síncrono**
   - **Por qué:** Garantiza que cada incidente tenga su resumen técnico al momento de creación
   - **Trade-off:** Mayor latencia (~2-3 segundos) vs garantía de datos completos
   - **Mejora futura:** Implementar procesamiento asíncrono con actualización posterior

5. **Autenticación: No implementada**
   - **Por qué:** El MVP se enfoca en la funcionalidad core de gestión de incidentes
   - **Supuesto:** Se implementará en una fase posterior antes de producción
   - **Riesgo:** Los endpoints están actualmente abiertos

6. **Sistema de módulos: ES Modules**
   - **Por qué:** Estándar moderno de JavaScript, mejor soporte en Node.js 18+
   - **Alternativas consideradas:** CommonJS
   - **Justificación:** Preparar el código para el futuro y mejor compatibilidad con herramientas modernas

### Supuestos

1. **Volumen de incidentes:** Se asume un volumen inicial bajo-medio (< 1000 incidentes/mes)
2. **Idioma:** Todas las descripciones y respuestas de IA están en español
3. **Privacidad:** Se asume que las descripciones de incidentes no contienen datos altamente sensibles que requieran anonimización
4. **Disponibilidad:** No se requiere alta disponibilidad (99.9%+) en la fase MVP
5. **Región:** Se asume despliegue en región `us-central1` de GCP para minimizar latencia
6. **Usuarios concurrentes:** Se asume < 100 usuarios concurrentes en fase inicial

## Ingeniería de Prompts (Desarrollo del Código)

Para el desarrollo de este backend, utilizamos técnicas de Prompt Engineering para generar código robusto, modular y moderno. A continuación, mostramos cómo evolucionaron nuestras instrucciones a la IA para obtener mejores resultados.


#### Prompt 1: (Intento Inicial - Exitoso)

> "En mi repo cambie de CommonJS a ES Modules, pero me esta dando error, podrias ayudarme a resolverlo?"

**Resultado:**
- En el package.json no estaba el type: "module" y se agregó

#### Prompt 2: (Fallido)
> "Tengo problemas al conectarme con Firebase"

#### Prompt 3: (Refinado - Exitoso)
> "Tengo problemas al conectarme con Firebase, dice que project_id not found"

**Por qué este prompt funcionó mejor:**
- Se especifica el error exacto que se produce


## Pendientes

### Despliegue a Cloud Run (Integración con GitHub)

El backend está preparado para desplegarse en **Google Cloud Run** conectando directamente el repositorio de GitHub (CI/CD).

#### Pasos para desplegar

1. **Preparar el Repositorio**
   - Asegúrate de que el código esté subido a GitHub.
   - Verifica que el archivo `serviceAccountKey.json` **NO** esté en el repositorio (debe estar en `.gitignore`).

2. **Configurar Secretos en Google Cloud**
   Antes de conectar el repo, es recomendable crear los secretos:
   - Ve a [Secret Manager](https://console.cloud.google.com/security/secret-manager).
   - Crea un secreto para `OPENAI_API_KEY` con tu key.
   - Crea un secreto para `GOOGLE_APPLICATION_CREDENTIALS` con el contenido del JSON de Firebase.

3. **Crear Servicio en Cloud Run**
   - Ve a [Cloud Run](https://console.cloud.google.com/run).
   - Haz clic en **"CREAR SERVICIO"**.
   - Selecciona **"Implementar una revisión continuamente desde un repositorio de origen"**.
   - Haz clic en **"CONFIGURAR CLOUD BUILD"**.

4. **Conectar con GitHub**
   - Selecciona **GitHub** como proveedor de repositorio.
   - Selecciona tu repositorio `fieldops-backend`.
   - Haz clic en **"Next"** y configura el activador de compilación:
     - Rama: `^main$` (o tu rama principal).
     - Tipo de compilación: **Google Cloud Buildpacks** (no requiere Dockerfile, aunque usa el archivo si existe).
   - Haz clic en **"GUARDAR"**.

5. **Configuración del Servicio**
   - **Nombre del servicio:** `fieldops-backend`
   - **Región:** `us-central1` (recomendado).
   - **Autenticación:** Selecciona **"Permitir invocaciones sin autenticar"**.
   - Expande **"Contenedor, volúmenes, redes, seguridad"**:
     - Pestaña **"VARIABLES Y SECRETOS"**:
       - Agrega variable `NODE_ENV` = `production`.
       - **Referenciar secretos:**
         - `OPENAI_API_KEY`: Expón como variable de entorno `OPENAI_API_KEY` seleccionando el secreto creado.
         - `GOOGLE_APPLICATION_CREDENTIALS`: Expón como variable de entorno `GOOGLE_APPLICATION_CREDENTIALS` o móntalo como volumen si prefieres (como variable es necesario que el código sepa leer JSON string si es el contenido, o ruta de archivo si es volumen). *Nota: Para simplificar, la opción más robusta es montar el secreto como archivo en `/app/serviceAccountKey.json` y apuntar la variable de entorno a esa ruta.*

6. **Finalizar**
   - Haz clic en **"CREAR"**.
   - Cloud Build iniciará la compilación automáticamente. Podrás ver el progreso en la pestaña "Registros".


#### Costos estimados.

| Servicio | Costo mensual estimado |
|----------|------------------------|
| Cloud Run (1000 requests/día) | ~$10 |
| Secret Manager | ~$0.50 |
| OpenAI API (10k incidentes) | ~$0.80 |
| **Total** | **~$11.30/mes** |

### Otras Tareas Pendientes

#### Alta Prioridad
- [ ] Implementar autenticación y autorización (JWT o Firebase Auth)
- [ ] Agregar validación de datos más robusta (usar Joi o Zod)
- [ ] Agregar logs estructurados (Winston o Pino)
- [ ] Implementar manejo de errores mejorado para IA (timeout, reintentos)

#### Media Prioridad
- [ ] Agregar tests unitarios e integración (Jest)
- [ ] Implementar procesamiento asíncrono de IA
- [ ] Agregar caché para análisis de IA (Redis)
- [ ] Implementar paginación en `GET /incidents`
- [ ] Agregar endpoints para actualizar y eliminar incidentes
- [ ] Documentar API con Swagger/OpenAPI

#### Baja Prioridad
- [ ] Implementar CI/CD con GitHub Actions
- [ ] Agregar monitoreo y alertas (Cloud Monitoring)
- [ ] Implementar anonimización automática de datos sensibles
- [ ] Optimizar costos de OpenAI (caché, límites de caracteres)
- [ ] Agregar soporte para múltiples idiomas
- [ ] Implementar webhooks para notificaciones