# Troubleshooting - Sistema de Importación

## 🚨 Problemas Comunes

### Error 502 Bad Gateway

**Síntoma**: Error de conectividad con Supabase
```
Error creando proyecto: {
  message: '<html>502 Bad Gateway</html>'
}
```

**Causas**:
- ❌ Problema de conectividad con Supabase
- ❌ Cloudflare bloqueando requests
- ❌ Variables de entorno incorrectas
- ❌ Rate limiting de Supabase

**Soluciones**:

#### 1. Verificar Variables de Entorno
```bash
# Verificar que estén configuradas
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Formato esperado
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

#### 2. Test de Conectividad
```bash
# Test directo a Supabase
curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/projects?select=*&limit=1"
```

#### 3. Implementar Retry Logic (Temporal)
```typescript
// En project-creation.service.ts
async validateUserPermissions(userId: string, retries = 3): Promise<ValidationResult> {
  for (let i = 0; i < retries; i++) {
    try {
      // ... lógica normal
      return result;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Backoff
    }
  }
}
```

### Usuario No Encontrado

**Síntoma**: Error de permisos de usuario
```
❌ Importación falló: { errors: [ 'Usuario no encontrado' ] }
```

**Causas**:
- ❌ Usuario `06aec8c6-b939-491b-b711-f04d7670e045` no existe en BD
- ❌ Usuario existe pero está inactivo
- ❌ Problema de conectividad (ver arriba)

**Soluciones**:

#### 1. Crear Usuario Fijo
```sql
-- En SQL Editor de Supabase
INSERT INTO public.users (id, name, email, role, active, created_at, updated_at)
VALUES (
  '06aec8c6-b939-491b-b711-f04d7670e045', 
  'Desarrollador Principal',
  'dev@miapp.com', 
  'dev', 
  true, 
  now(), 
  now()
)
ON CONFLICT (id) DO UPDATE SET
  active = true,
  updated_at = now();
```

#### 2. Saltar Validación (Para Testing)
```typescript
// Temporal en ProjectCreationService.validateUserPermissions()
async validateUserPermissions(userId: string): Promise<ValidationResult> {
  // TODO: Remover en producción
  if (process.env.NODE_ENV === 'development') {
    return { canCreate: true };
  }
  
  // ... lógica normal
}
```

#### 3. Usar Usuario Dinámico
```typescript
// En import-orchestrator.service.ts
private async getAvailableDeveloper(): Promise<string> {
  const { data: users } = await this.supabase
    .from('users')
    .select('id')
    .eq('active', true)
    .eq('role', 'dev')
    .limit(1);
    
  return users?.[0]?.id || FIXED_DEVELOPER_ID;
}
```

### Error de Validación Schema Zod

**Síntoma**: La IA genera datos que no pasan validación
```
Error [AI_TypeValidationError]: Priority value exceeds maximum
```

**Causas**:
- ❌ IA genera prioridades fuera del rango permitido
- ❌ Campos requeridos faltantes
- ❌ Tipos incorrectos en response de IA

**Soluciones**:

#### 1. Revisar Prompts de IA
```typescript
// En markdown-processor.ts - asegurar instrucciones claras
private static createProjectAnalysisPrompt(markdown: string): string {
  return `
IMPORTANTE: La prioridad DEBE ser exactamente uno de estos valores:
- CRÍTICA
- ALTA  
- MEDIA
- BAJA
- PENDIENTE

NO uses números, solo estos textos exactos.
`;
}
```

#### 2. Validación Pre-Schema
```typescript
// Antes de llamar generateObject
const sanitizeAIResponse = (response: any) => {
  if (response.epics) {
    response.epics = response.epics.map(epic => ({
      ...epic,
      // Sanitizar prioridad
      priority: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'PENDIENTE']
        .includes(epic.priority) ? epic.priority : 'MEDIA'
    }));
  }
  return response;
};
```

#### 3. Schema Más Permisivo (Temporal)
```typescript
// En import.ts - hacer campos opcionales temporalmente
export const EpicBasicInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string().optional(),
  estimatedWeeks: z.number().min(1).max(12).default(2), // Default si falla
  priority: z.enum(['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'PENDIENTE']).default('MEDIA')
});
```

### Timeout en Procesamiento

**Síntoma**: Request tarda demasiado (>60s)
```
Error: Request timeout after 60000ms
```

**Causas**:
- ❌ Markdown muy grande (>50KB)
- ❌ Demasiadas épicas (>20)
- ❌ Rate limiting de OpenAI
- ❌ Procesamiento serial lento

**Soluciones**:

#### 1. Dividir Importación
```markdown
<!-- Dividir specs grandes en chunks -->
# Proyecto Completo - Parte 1/3

# EP-01 — Autenticación
# EP-02 — Usuario Base  
# EP-03 — Dashboard Principal

<!-- Importar por separado -->
# Proyecto Completo - Parte 2/3

# EP-04 — Reportes
# EP-05 — Analytics
# EP-06 — Integraciones
```

#### 2. Increase Timeout (Next.js Config)
```typescript
// next.config.ts
export default {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '10mb'
    }
  },
  // Para Vercel
  functions: {
    maxDuration: 300 // 5 minutos
  }
};
```

#### 3. Procesamiento Asíncrono
```typescript
// En import-orchestrator.service.ts
async processFullImport(request: ImportRequest): Promise<FullImportResult> {
  // Para proyectos grandes, procesar async
  if (this.isLargeProject(request.markdown)) {
    return this.processAsyncImport(request);
  }
  
  // Procesamiento normal para proyectos pequeños
  return this.processSyncImport(request);
}
```

### Error de OpenAI API

**Síntoma**: Fallos en las llamadas de IA
```
Error en análisis inicial del proyecto: API rate limit exceeded
```

**Causas**:
- ❌ Rate limit de OpenAI excedido
- ❌ API key inválida o sin crédito
- ❌ Request demasiado grande
- ❌ Prompt malformado

**Soluciones**:

#### 1. Verificar API Key
```bash
# Test directo a OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

#### 2. Implement Rate Limiting
```typescript
// Rate limiter simple
class AIRateLimiter {
  private lastCall = 0;
  private minInterval = 1000; // 1 segundo entre calls
  
  async waitIfNeeded() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }
    
    this.lastCall = Date.now();
  }
}
```

#### 3. Fallback Strategy
```typescript
// En MarkdownProcessor.processProjectAnalysis()
try {
  return await generateObject({ ... });
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Esperar y reintentar
    await new Promise(resolve => setTimeout(resolve, 5000));
    return await generateObject({ ... });
  }
  
  // Fallback manual
  return this.createFallbackAnalysis(markdown);
}
```

---

## 🔧 Debugging Avanzado

### Logging Detallado

#### 1. Enable Debug Logs
```typescript
// En import-orchestrator.service.ts
async processFullImport(request: ImportRequest): Promise<FullImportResult> {
  const debug = process.env.DEBUG_IMPORT === 'true';
  
  if (debug) {
    console.log('🔍 Starting import with:', {
      markdownLength: request.markdown.length,
      uploaderId: request.uploaderId,
      timestamp: new Date().toISOString()
    });
  }
  
  // Log cada fase
  const phases = ['projectAnalysis', 'projectCreation', /* ... */];
  for (const phase of phases) {
    if (debug) console.log(`⏳ Starting ${phase}...`);
    
    const result = await this[`execute${phase}`]();
    
    if (debug) {
      console.log(`${result.success ? '✅' : '❌'} ${phase}:`, {
        success: result.success,
        dataType: typeof result.data,
        errorCount: result.feedback?.errors?.length || 0
      });
    }
  }
}
```

#### 2. Request/Response Logging
```typescript
// En middleware.ts o api route
export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  console.log(`📡 [${requestId}] Import request started`);
  
  try {
    const result = await orchestrator.processFullImport(importRequest);
    
    console.log(`✅ [${requestId}] Import completed in ${Date.now() - startTime}ms`, {
      success: result.success,
      projectId: result.projectId,
      summary: result.summary
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(`❌ [${requestId}] Import failed in ${Date.now() - startTime}ms:`, error);
    throw error;
  }
}
```

### Performance Monitoring

#### 1. Phase Timing
```typescript
class PerformanceMonitor {
  private phases: Record<string, { start: number; duration?: number }> = {};
  
  startPhase(name: string) {
    this.phases[name] = { start: Date.now() };
  }
  
  endPhase(name: string) {
    const phase = this.phases[name];
    if (phase) {
      phase.duration = Date.now() - phase.start;
    }
  }
  
  getReport() {
    return Object.entries(this.phases).map(([name, data]) => ({
      phase: name,
      duration: data.duration || 0,
      status: data.duration ? 'completed' : 'running'
    }));
  }
}
```

#### 2. Memory Usage
```typescript
const trackMemory = () => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    console.log('💾 Memory usage:', {
      rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB'
    });
  }
};
```

### Test Data Setup

#### 1. Minimal Test Project
```sql
-- Setup mínimo para testing
INSERT INTO public.users (id, name, email, role, active, created_at, updated_at)
VALUES ('06aec8c6-b939-491b-b711-f04d7670e045', 'Test User', 'test@test.com', 'dev', true, now(), now())
ON CONFLICT (id) DO NOTHING;
```

#### 2. Test Markdown
```markdown
# Proyecto de Test

# EP-01 — Feature Simple

**Objetivo:** Test básico del sistema

**Prioridad:** MEDIA

## Historias
* **ST-01.1** Como usuario quiero hacer login (3 pts)

## Tareas  
* **FE-01** Formulario de login
* **BE-01** API de autenticación
```

#### 3. Integration Test
```typescript
// test/import.integration.test.ts
describe('Import System Integration', () => {
  it('should import a simple project', async () => {
    const response = await fetch('/api/dashboard/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markdown: testMarkdown,
        uploaderId: '06aec8c6-b939-491b-b711-f04d7670e045'
      })
    });
    
    const result = await response.json();
    
    expect(result.success).toBe(true);
    expect(result.projectId).toBeDefined();
    expect(result.summary.epics).toBeGreaterThan(0);
  });
});
```

---

## 📊 Health Checks

### 1. System Health Endpoint
```typescript
// pages/api/health/import.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  };
  
  // Check OpenAI
  try {
    const aiTest = await MarkdownProcessor.processProjectAnalysis('# Test');
    health.services.openai = 'healthy';
  } catch (error) {
    health.services.openai = 'error';
    health.status = 'degraded';
  }
  
  // Check Supabase
  try {
    const supabase = createSupabaseServerClient();
    await supabase.from('users').select('id').limit(1);
    health.services.supabase = 'healthy';
  } catch (error) {
    health.services.supabase = 'error';
    health.status = 'degraded';
  }
  
  return NextResponse.json(health);
}
```

### 2. Monitoring Dashboard
```typescript
// Métricas para dashboard
interface ImportMetrics {
  totalImports: number;
  successRate: number;
  averageProcessingTime: number;
  errorsByType: Record<string, number>;
  phaseSuccessRates: Record<string, number>;
}
```

---

## 🆘 Contacto y Soporte

### Reportar Bugs

1. **Información requerida**:
   - Markdown usado (sanitizado)
   - Mensaje de error completo
   - Timestamp del problema  
   - Browser/environment info

2. **Logs útiles**:
   - Console logs del browser
   - Network tab (request/response)
   - Error stack traces

3. **Reproducción**:
   - Pasos exactos para reproducir
   - Comportamiento esperado vs actual
   - Frequencia del problema (siempre/intermitente)

### Configuración de Desarrollo

Para debugging local:

```bash
# Enable debug logs
DEBUG_IMPORT=true npm run dev

# Test con datos mínimos
curl -X POST http://localhost:3000/api/dashboard/import \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# Test\n## EP-01: Simple test","uploaderId":"06aec8c6-b939-491b-b711-f04d7670e045"}'
```

---

Esta guía de troubleshooting cubre los **problemas más comunes** y sus **soluciones probadas** para mantener el sistema funcionando de manera confiable.
