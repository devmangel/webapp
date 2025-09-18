# API Reference - Sistema de Importación

## 📡 Endpoints

### POST `/api/dashboard/import`

**Descripción**: Importa un proyecto completo desde markdown con IA

**Headers**:
```http
Content-Type: application/json
```

**Request Body**:
```typescript
{
  markdown: string;        // Contenido markdown a procesar
  uploaderId: string;      // ID del usuario que crea el proyecto  
  assigneeId?: string;     // ID del desarrollador (opcional, usa fijo por defecto)
}
```

**Response**:
```typescript
FullImportResult {
  success: boolean;
  projectId?: string;
  summary?: ImportSummary;
  phases: ImportPhaseResults;
  feedback: ConsolidatedFeedback;
}
```

**Ejemplo de Request**:
```bash
curl -X POST http://localhost:3000/api/dashboard/import \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# EP-01 — Registro & Autenticación\n\n**Objetivo:** permitir crear cuenta...",
    "uploaderId": "06aec8c6-b939-491b-b711-f04d7670e045",
    "assigneeId": "06aec8c6-b939-491b-b711-f04d7670e045"
  }'
```

**Ejemplo de Response (Éxito)**:
```json
{
  "success": true,
  "projectId": "bf831188-0e5c-467d-88dc-e2e5bc216289",
  "summary": {
    "project": "Sistema de Publicación y Verificación de WhatsApp",
    "sprints": 12,
    "epics": 12,
    "stories": 45,
    "tasks": 120
  },
  "phases": {
    "projectAnalysis": { "success": true },
    "projectCreation": { "success": true },
    "sprintCreation": { "success": true },
    "detailedProcessing": { "success": true },
    "epicProcessing": { "success": true },
    "storyProcessing": { "success": true },
    "taskProcessing": { "success": true }
  },
  "feedback": {
    "errors": [],
    "warnings": [
      {
        "type": "SUGGESTION",
        "message": "Se generaron criterios de aceptación automáticamente para 5 historias"
      }
    ],
    "completions": [
      {
        "type": "PROJECT_METADATA",
        "target": "Código del proyecto",
        "generated": "PROJ-WA01"
      }
    ]
  }
}
```

**Ejemplo de Response (Error)**:
```json
{
  "success": false,
  "phases": {
    "projectAnalysis": { "success": false },
    "projectCreation": { "success": false },
    "sprintCreation": { "success": false },
    "detailedProcessing": { "success": false },
    "epicProcessing": { "success": false },
    "storyProcessing": { "success": false },
    "taskProcessing": { "success": false }
  },
  "feedback": {
    "errors": [
      {
        "type": "CRITICAL",
        "message": "Error de conexión. Verifique su conexión a internet e intente de nuevo.",
        "suggestion": "502 Bad Gateway"
      }
    ],
    "warnings": [],
    "completions": []
  }
}
```

---

## 🎯 Tipos TypeScript

### Tipos de Entrada

#### ImportRequest
```typescript
interface ImportRequest {
  markdown: string;        // Especificación en markdown
  uploaderId: string;      // Usuario que crea el proyecto
  assigneeId?: string;     // Desarrollador asignado (opcional)
}
```

### Tipos de IA (Procesamiento)

#### ProjectAnalysis (Primera Fase IA)
```typescript
interface ProjectAnalysis {
  projectMetadata: ProjectMetadata;
  epics: EpicBasicInfo[];
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedTeamSize: number; // 1-10 personas
}

interface ProjectMetadata {
  name: string;               // "Sistema de Gestión de Usuarios"
  description?: string;       // Descripción opcional del proyecto
  suggestedCode: string;      // "PROJ-SGU" (generado por IA)
  estimatedDuration?: string; // "12 weeks", "3 months", etc.
}

interface EpicBasicInfo {
  id: string;                          // "EP-01"
  title: string;                       // "Registro & Autenticación"
  objective?: string;                  // Objetivo de la épica
  estimatedWeeks: number;              // 1-12 semanas
  priority: PriorityLevel;             // Ver enum abajo
}
```

#### DetailedContent (Segunda Fase IA)
```typescript
interface DetailedContent {
  success: boolean;
  stories: StoryImport[];
  tasks: TaskImport[];
  errors: FeedbackItem[];
  warnings: FeedbackItem[];
  completions: Completion[];
}

interface StoryImport {
  id: string;                    // "ST-01.1"
  epicId: string;                // "EP-01" (referencia a épica)
  title: string;                 // Título de la historia
  description: string;           // Descripción detallada
  acceptanceCriteria: string[];  // Lista de criterios
  storyPoints: number;           // 1,2,3,5,8,13,21 (Fibonacci)
  persona?: string;              // "Como usuario"
  need?: string;                 // "quiero poder"
  outcome?: string;              // "para que"
}

interface TaskImport {
  id: string;                    // "FE-01"
  storyId?: string;              // "ST-01.1" (opcional)
  epicId?: string;               // "EP-01" (opcional)
  type: TaskType;                // Ver enum abajo
  title: string;                 // Título de la tarea
  description?: string;          // Descripción técnica
  labels: string[];              // Etiquetas adicionales
  dependencies: string[];        // IDs de tareas dependientes
}
```

### Enums Importantes

#### PriorityLevel (Prioridades Textuales)
```typescript
type PriorityLevel = 
  | 'CRÍTICA'    // Máxima prioridad - infraestructura crítica
  | 'ALTA'       // Alta prioridad - funcionalidades principales  
  | 'MEDIA'      // Prioridad normal - funcionalidades importantes
  | 'BAJA'       // Baja prioridad - mejoras y optimizaciones
  | 'PENDIENTE'; // Para futuras iteraciones

// Mapeo a base de datos:
// CRÍTICA → 'critical'
// ALTA → 'high'  
// MEDIA → 'medium'
// BAJA → 'low'
// PENDIENTE → 'low'
```

#### TaskType (Tipos de Tareas)
```typescript
type TaskType = 
  | 'FE'     // Frontend - React/UI components
  | 'BE'     // Backend - API endpoints, business logic
  | 'OPS'    // Operations - DevOps, infrastructure  
  | 'DOCS'   // Documentation - technical docs
  | 'TEST';  // Testing - unit tests, e2e tests

// Mapeo a prioridades:
// FE → 'medium'
// BE → 'high' (más crítico)
// OPS → 'high' (crítico para deployment)  
// DOCS → 'low'
// TEST → 'medium'
```

### Tipos de Resultado

#### FullImportResult
```typescript
interface FullImportResult {
  success: boolean;
  projectId?: string;              // UUID del proyecto creado
  summary?: ImportSummary;         // Estadísticas del resultado
  phases: ImportPhaseResults;      // Estado de cada fase
  feedback: ConsolidatedFeedback;  // Errores, warnings y completions
}

interface ImportSummary {
  project: string;    // Nombre del proyecto creado
  sprints: number;    // Número de sprints generados
  epics: number;      // Número de épicas procesadas
  stories: number;    // Número de historias creadas
  tasks: number;      // Número de tareas creadas
}

interface ImportPhaseResults {
  projectAnalysis: ImportPhaseResult;     // IA Fase 1
  projectCreation: ImportPhaseResult;     // Crear proyecto
  sprintCreation: ImportPhaseResult;      // Generar sprints  
  detailedProcessing: ImportPhaseResult;  // IA Fase 2
  epicProcessing: ImportPhaseResult;      // Procesar épicas
  storyProcessing: ImportPhaseResult;     // Procesar historias
  taskProcessing: ImportPhaseResult;      // Procesar tareas
}

interface ImportPhaseResult {
  success: boolean;
  data?: unknown;                  // Datos específicos de la fase
  error?: string;                  // Mensaje de error si falló
  feedback?: ConsolidatedFeedback; // Feedback específico de la fase
}
```

### Tipos de Feedback

#### ConsolidatedFeedback
```typescript
interface ConsolidatedFeedback {
  errors: FeedbackItem[];      // Errores críticos
  warnings: FeedbackItem[];    // Advertencias y sugerencias  
  completions: Completion[];   // Auto-completados por IA
}

interface FeedbackItem {
  type: FeedbackType;
  message: string;           // Mensaje principal
  location?: string;         // Ubicación del problema
  suggestion?: string;       // Sugerencia de solución
  field?: string;           // Campo específico afectado
  autoValue?: string;       // Valor auto-completado
}

type FeedbackType = 
  | 'CRITICAL'           // Error que impide continuar
  | 'VALIDATION'         // Error de validación de datos
  | 'SYNTAX'             // Error de sintaxis markdown
  | 'AUTO_COMPLETION'    // Campo completado automáticamente
  | 'MISSING_FIELD'      // Campo requerido faltante
  | 'SUGGESTION';        // Sugerencia de mejora

interface Completion {
  type: CompletionType;
  target: string;              // Elemento afectado
  generated: string | number;  // Valor generado
}

type CompletionType =
  | 'DESCRIPTION'        // Descripción generada automáticamente
  | 'STORY_POINTS'       // Story points estimados por IA
  | 'CRITERIA'           // Criterios de aceptación generados
  | 'DEPENDENCIES'       // Dependencias detectadas automáticamente
  | 'TYPE'               // Tipo de tarea inferido
  | 'PROJECT_METADATA';  // Metadatos del proyecto generados
```

### Tipos de Base de Datos

#### ProjectCreationResult
```typescript
interface ProjectCreationResult {
  projectId: string;      // UUID generado
  projectCode: string;    // Código único (ej: "PROJ-WA01")
  projectName: string;    // Nombre del proyecto
}
```

#### SprintCreationResult  
```typescript
interface SprintCreationResult {
  sprints: SprintMapping[];
  totalSprints: number;
}

interface SprintMapping {
  epicId: string;      // ID de la épica
  sprintId: string;    // UUID del sprint creado
  sprintName: string;  // "Sprint 1: Registro"
  startDate: string;   // "2025-09-23" (ISO date)
  endDate: string;     // "2025-10-04" (ISO date)
}
```

---

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# OpenAI (para IA)
OPENAI_API_KEY=sk-...

# Supabase (para base de datos)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Next.js
NODE_ENV=development|production
```

### Constantes del Sistema

```typescript
// Usuario desarrollador fijo para asignación de tareas
const FIXED_DEVELOPER_ID = '06aec8c6-b939-491b-b711-f04d7670e045';

// Configuración de IA
const AI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.1,        // Para consistencia
  maxTokens: 4000,        // Por llamada
  timeout: 30000          // 30 segundos
};

// Configuración de sprints
const SPRINT_CONFIG = {
  minWeeks: 2,            // Mínimo 2 semanas por sprint
  maxWeeks: 4,            // Máximo 4 semanas por sprint
  startDay: 'monday',     // Sprints empiezan en lunes
  endDay: 'friday'        // Sprints terminan en viernes
};
```

---

## 🚦 Estados y Códigos HTTP

### Códigos de Respuesta

| Código | Estado | Descripción |
|--------|--------|-------------|
| `200` | ✅ Éxito | Procesamiento completado (success: true/false) |
| `400` | ❌ Error | Request inválido (markdown vacío, userId faltante) |
| `401` | ❌ Error | No autorizado (usuario sin permisos) |
| `429` | ⚠️ Warning | Rate limit excedido (muchas llamadas IA) |
| `500` | ❌ Error | Error interno del servidor |
| `502` | ⚠️ Warning | Bad Gateway (problema conectividad Supabase) |

### Estados de Procesamiento

```typescript
type ProcessingStatus = 
  | 'pending'      // Esperando procesamiento
  | 'processing'   // En progreso  
  | 'completed'    // Completado exitosamente
  | 'failed'       // Falló con error
  | 'partial';     // Parcialmente completado

type PhaseStatus = {
  [K in keyof ImportPhaseResults]: ProcessingStatus;
};
```

---

## 📊 Métricas y Limitaciones

### Limitaciones Actuales

| Aspecto | Límite | Notas |
|---------|--------|-------|
| **Markdown size** | ~50KB | Limitado por context window de IA |
| **Épicas máximas** | Sin límite | Limitado por prioridades textuales |
| **Historias máximas** | ~200 | Limitado por processing time |
| **Tareas máximas** | ~500 | Limitado por batch size Supabase |
| **Tiempo procesamiento** | ~60s | Timeout del endpoint |
| **Llamadas IA concurrentes** | 1 | Secuencial para evitar rate limits |

### Performance Esperada

```typescript
interface PerformanceMetrics {
  smallProject: {    // < 5 épicas
    processingTime: '10-20s';
    accuracy: '95%';
  };
  mediumProject: {   // 5-15 épicas  
    processingTime: '20-45s';
    accuracy: '90%';
  };
  largeProject: {    // 15+ épicas
    processingTime: '45-60s';
    accuracy: '85%';
  };
}
```

---

Esta API está diseñada para ser **robusta**, **predecible** y **fácil de integrar** con cualquier frontend o sistema externo.
