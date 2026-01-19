# Capacidad de IA - FieldOps Backend

## Descripción General

El backend integra **OpenAI GPT-4o-mini** para analizar automáticamente las descripciones de incidentes y generar resúmenes técnicos que se persisten en el campo `ai_summary`.

**Flujo:**
1. Usuario crea incidente con descripción
2. Sistema envía descripción a OpenAI
3. Se genera resumen técnico automático
4. Campo `ai_summary` se guarda en Firestore

**Ejemplo:**

```javascript
// Entrada
{
  "title": "Error en login",
  "description": "Los usuarios no pueden iniciar sesión desde la app móvil",
  "urgency": "high"
}

// Respuesta (incluye ai_summary)
{
  "id": "abc123",
  "title": "Error en login",
  "description": "Los usuarios no pueden iniciar sesión desde la app móvil",
  "urgency": "high",
  "ai_summary": "Fallo de autenticación en cliente móvil. Posibles causas: problema de conectividad, error en validación de credenciales, o incompatibilidad de versión del SDK móvil.",
  "createdAt": "2026-01-19T12:00:00Z"
}
```

## Manejo de Latencia

### Situación Actual
- **Procesamiento síncrono:** Usuario espera ~2-3 segundos
- **Ventaja:** Garantiza que el incidente siempre tenga resumen
- **Desventaja:** Mayor tiempo de respuesta

### Propuesta de Mejora: Procesamiento Asíncrono

```javascript
export const createIncident = async (req, res) => {
    const { title, description, urgency } = req.body;
    
    // Guardar incidente inmediatamente con placeholder
    const incident = await saveIncident({
        title, description, urgency,
        ai_summary: "Analizando..."
    });
    
    // Responder rápidamente
    res.status(201).json(incident);
    
    // Analizar en segundo plano y actualizar
    analyzeIncidentInBackground(incident.id, description);
};
```

**Métricas:**
- Sin IA: ~100-200ms
- Con IA síncrono: ~2000-3000ms
- Con IA asíncrono: ~100-200ms (respuesta inicial)

## Manejo de Costos

### Modelo: GPT-4o-mini
- **Input:** $0.150 por 1M tokens
- **Output:** $0.600 por 1M tokens

### Costo por Incidente
Asumiendo ~150 tokens input + ~100 tokens output:
```
Costo total: ~$0.00008 por incidente
```

### Proyección Mensual

| Incidentes/mes | Costo |
|----------------|-------|
| 1,000 | $0.08 |
| 10,000 | $0.80 |
| 100,000 | $8.00 |

### Optimizaciones
1. **Límite de caracteres:** Truncar descripciones largas (máx. 500 caracteres)
2. **Caché:** Guardar análisis de descripciones similares
3. **Rate limiting:** Limitar análisis por usuario/minuto

## Manejo de Fallos

### Tipos de Fallos
- API key inválida o expirada
- Rate limit exceeded (429)
- Timeout de red
- Errores del servicio (500, 503)

### Estrategia Mejorada

```javascript
export const createIncident = async (req, res) => {
    try {
        const { title, description, urgency } = req.body;
        let ai_summary = "No disponible";
        
        try {
            // Intentar con timeout de 5 segundos
            ai_summary = await Promise.race([
                analyzeIncidentWithAI(description),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Timeout")), 5000)
                )
            ]);
        } catch (aiError) {
            console.error("AI failed:", aiError);
            ai_summary = "Error al generar resumen";
        }
        
        // Guardar incidente de todas formas
        const incident = await saveIncident({
            title, description, urgency, ai_summary
        });
        
        res.status(201).json(incident);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
```

### Reintentos con Exponential Backoff

```javascript
async function analyzeIncidentWithAI(description, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Respondeme en español..." },
                    { role: "user", content: description }
                ],
                timeout: 10000
            });
            return response.choices[0].message.content;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => 
                setTimeout(resolve, Math.pow(2, i) * 1000) // 1s, 2s, 4s
            );
        }
    }
}
```

## Privacidad y Secretos

### Datos Sensibles

**IMPORTANTE:** Las descripciones pueden contener información sensible (nombres, IPs, datos de infraestructura).

**Política de OpenAI:**
- NO usa datos de API para entrenar modelos
- Retención de 30 días para monitoreo de abuso

### Anonimización Recomendada

```javascript
function sanitizeDescription(description) {
    return description
        .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
        .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
}

const sanitized = sanitizeDescription(description);
const ai_summary = await analyzeIncidentWithAI(sanitized);
```

### Manejo de Secretos

**Buenas Prácticas Implementadas:**
- API Key en `.env` (no hardcodeada)
- `.env` en `.gitignore`

**Recomendaciones para Producción:**

```javascript
// Usar Google Cloud Secret Manager
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getOpenAIKey() {
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({
        name: 'projects/PROJECT_ID/secrets/openai-api-key/versions/latest',
    });
    return version.payload.data.toString();
}
```

- Rotar API keys periódicamente
- Limitar permisos de la API key
- Monitorear uso para detectar accesos no autorizados

## Configuración

### Variables de Entorno

```env
OPENAI_API_KEY=sk-proj-your-api-key-here
```

**Obtener API Key:**
1. Ir a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crear nueva API key
3. Agregar al archivo `.env`

## Limitaciones Actuales

- Sin procesamiento asíncrono (usuario espera ~2-3s)
- Sin reintentos automáticos
- Sin caché de respuestas
- Sin anonimización automática
- Sin rate limiting

## Mejoras Propuestas

- [ ] Procesamiento asíncrono
- [ ] Sistema de reintentos con exponential backoff
- [ ] Caché de respuestas similares
- [ ] Anonimización automática de datos sensibles
- [ ] Rate limiting por usuario
- [ ] Migrar secretos a Google Cloud Secret Manager
- [ ] Métricas y monitoreo de costos
