# Propuesta de CI/CD - FieldOps Backend

## Descripción General

Estrategia de **Continuous Integration** y **Continuous Deployment** para el backend de FieldOps usando GitHub Actions y Google Cloud Platform.

## Branching Strategy

### Modelo: GitHub Flow Simplificado

```
main (producción)
  ↑
  ├── feature/nombre-feature
  ├── fix/nombre-bug
  └── hotfix/nombre-urgente
```

### Ramas

**`main`** (Protegida)
- Código en producción
- Requiere PR + revisión + CI passing
- Deploy automático a GCP
- No permite push directo

**Ramas de trabajo:**
- `feature/*` - Nuevas funcionalidades
- `fix/*` - Corrección de bugs
- `hotfix/*` - Correcciones urgentes

## Pipeline CI/CD

### GitHub Actions: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  GCP_PROJECT_ID: 'fieldops-prod'
  GCP_REGION: 'us-central1'
  SERVICE_NAME: 'fieldops-backend'

jobs:
  ci:
    name: Continuous Integration
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build --if-present

  cd:
    name: Deploy to GCP
    runs-on: ubuntu-latest
    needs: ci
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      
      - name: Auth to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --source . \
            --platform managed \
            --region ${{ env.GCP_REGION }} \
            --allow-unauthenticated \
            --set-env-vars "NODE_ENV=production" \
            --set-secrets "OPENAI_API_KEY=openai-api-key:latest,GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account:latest"
```

## Testing Mínimo

### Estrategia de 3 Niveles

**1. Unit Tests** - Funciones individuales

```javascript
// src/services/ai.service.test.js
import { analyzeIncidentWithAI } from './ai.service.js';

test('should return technical summary', async () => {
    const summary = await analyzeIncidentWithAI('El servidor no responde');
    expect(summary).toBeDefined();
    expect(typeof summary).toBe('string');
});
```

**2. Integration Tests** - Controladores + Servicios

```javascript
// src/controllers/incidents.controller.test.js
import request from 'supertest';
import app from '../app.js';

test('should create incident with AI summary', async () => {
    const response = await request(app)
        .post('/incidents/create-incident')
        .send({ title: 'Test', description: 'Test desc', urgency: 'high' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('ai_summary');
});
```

**3. E2E Tests** - Flujos completos (Postman/Newman)

### Configuración

**`package.json`**
```json
{
  "scripts": {
    "test": "NODE_OPTIONS=--experimental-vm-modules jest",
    "test:coverage": "npm test -- --coverage",
    "lint": "eslint src/"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.0.0"
  }
}
```

**`jest.config.js`**
```javascript
export default {
  testEnvironment: 'node',
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70 }
  }
};
```

### Criterios de Aprobación
- Todos los tests pasan
- Cobertura ≥ 70%
- Linter sin errores
- Al menos 1 code review aprobado

## Despliegue a Google Cloud Platform

### Cloud Run (Serverless)

**Ventajas:**
- Escala automáticamente
- Pago por uso
- Integración con Secret Manager
- HTTPS automático

### Configuración

**`Dockerfile`** (opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

**`.dockerignore`**
```
node_modules
.env
.git
*.md
serviceAccountKey.json
```

## Manejo de Secretos

### Ambientes

| Ambiente | Branch | Deploy | Secretos |
|----------|--------|--------|----------|
| Desarrollo | `feature/*` | Local | `.env` local |
| Producción | `main` | Automático | Secret Manager |

### Google Cloud Secret Manager

**Crear secretos:**
```bash
# OpenAI API Key
echo "sk-proj-..." | gcloud secrets create openai-api-key --data-file=-

# Firebase Service Account
gcloud secrets create firebase-service-account --data-file=serviceAccountKey.json

# Dar permisos
gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Acceso desde código:**
```javascript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getSecret(secretName) {
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({
        name: `projects/${process.env.GCP_PROJECT_ID}/secrets/${secretName}/versions/latest`,
    });
    return version.payload.data.toString();
}
```

### GitHub Secrets

Configurar en **Settings → Secrets → Actions**:
- `GCP_SA_KEY` - Service Account JSON
- `GCP_PROJECT_ID` - ID del proyecto

## Implementación Rápida

### 1. Configurar GCP

```bash
# Crear proyecto
gcloud projects create fieldops-prod

# Habilitar APIs
gcloud services enable run.googleapis.com secretmanager.googleapis.com

# Crear Service Account
gcloud iam service-accounts create github-actions

# Dar permisos
gcloud projects add-iam-policy-binding fieldops-prod \
  --member="serviceAccount:github-actions@fieldops-prod.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Generar key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@fieldops-prod.iam.gserviceaccount.com
```

### 2. Configurar GitHub

1. Agregar `GCP_SA_KEY` (contenido de `key.json`)
2. Agregar `GCP_PROJECT_ID` (`fieldops-prod`)

### 3. Crear Workflow

Crear `.github/workflows/ci-cd.yml` con el contenido mostrado arriba.

### 4. Deploy

```bash
git add .
git commit -m "Setup CI/CD"
git push origin main
```

## Rollback

**Opción 1: Revertir commit**
```bash
git revert HEAD
git push origin main
```

**Opción 2: Deploy manual de versión anterior**
```bash
gcloud run revisions list --service=fieldops-backend
gcloud run services update-traffic fieldops-backend \
  --to-revisions=fieldops-backend-00042-abc=100
```

## Costos Estimados

| Servicio | Costo/mes |
|----------|-----------|
| Cloud Run | $10 |
| Secret Manager | $0.50 |
| OpenAI API | $0.80 (10k incidents) |
| **TOTAL** | **~$11/mes** |

## Monitoreo

**Cloud Logging:**
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

**Alertas recomendadas:**
- Error rate > 5%
- Latencia p95 > 3s
- Costo OpenAI > $50/día

## Mejoras Futuras

- [ ] Ambiente de staging
- [ ] Tests de carga
- [ ] Análisis de seguridad (Snyk)
- [ ] Canary releases
- [ ] Notificaciones en Slack
