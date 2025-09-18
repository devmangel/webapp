# Arquitectura Técnica del Sistema de Importación

## 🏗️ Diseño General

El sistema está diseñado con **arquitectura orientada a servicios** donde cada componente tiene una responsabilidad específica y bien definida. Utiliza el patrón **Orchestrator** para coordinar el flujo completo.

## 📋 Principios de Diseño

### 1. Separación de Responsabilidades
- **Un servicio = Una responsabilidad**
- **IA separada** del procesamiento de datos
- **Validación** en múltiples capas
- **Error handling** granular por fase

### 2. Estrategia Híbrida de IA
```typescript
// Fase 1: Análisis rápido del proyecto
ProjectAnalysis = IA.analyze(markdown) → {
  projectMetadata: ProjectMetadata,
  epics: EpicBasicInfo[],
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH',
  suggestedTeamSize: number
}

// Fase 2: Procesamiento detallado con contexto
DetailedContent = IA.processDetailed(markdown, projectAnalysis, assigneeId) → {
  stories: StoryImport[],
  tasks: TaskImport[],
  errors: FeedbackItem[],
  warnings: FeedbackItem[],
  completions: Completion[]
}
```

### 3. Flujo Inmutable
- Cada fase **no modifica** el estado anterior
- **Rollback automático** en caso de error
- **Validación temprana** en cada transición
- **Logging completo** para auditoría

## 🔧 Componentes Detallados

### ImportOrchestrator
**Ubicación**: `src/app/lib/supabase/import-orchestrator.service.ts`

```typescript
class ImportOrchestrator {
  // Servicios inyectados
  private projectService = new ProjectCreationService();
  private sprintService = new SprintGenerationService();
  private epicService = new EpicProcessingService();
  private storyService = new StoryProcessingService();
  private taskService = new TaskProcessingService();

  // Flujo principal
  async processFullImport(request: ImportRequest): Promise<FullImportResult>
}
```

**Responsabilidades**:
- Coordinar las 8 fases del procesamiento
- Manejar errores y rollbacks
- Generar feedback consolidado
- Mantener estado de progreso

### MarkdownProcessor
**Ubicación**: `src/app/lib/ai/markdown-processor.ts`

```typescript
class MarkdownProcessor {
  // Primera llamada IA
  static async processProjectAnalysis(markdown: string): Promise<ProjectAnalysis>
  
  // Segunda llamada IA  
  static async processDetailedContent(
    markdown: string, 
    projectAnalysis: ProjectAnalysis, 
    assigneeId: string
  ): Promise<DetailedContent>
}
```

**Características técnicas**:
- Usa **OpenAI GPT-4o-mini** con `generateObject()`
- **Schemas Zod** para validación estricta
- **Temperatura 0.1** para consistencia
- **Fallbacks** en caso de error

### ProjectCreationService
**Ubicación**: `src/app/lib/supabase/project-creation.service.ts`

```typescript
class ProjectCreationService {
  async validateUserPermissions(userId: string): Promise<ValidationResult>
  async createProject(metadata: ProjectMetadata, ownerId: string): Promise<CreationResult>
}
```

**Lógica de creación**:
1. Valida permisos del usuario
2. Genera código único del proyecto
3. Crea registro en `projects` table
4. Establece owner y permisos iniciales

### SprintGenerationService
**Ubicación**: `src/app/lib/supabase/sprint-generation.service.ts`

**Estrategia**: **1 Sprint por Épica**
```typescript
class SprintGenerationService {
  async generateSprintsFromEpics(
    projectId: string,
    epics: EpicBasicInfo[]
  ): Promise<SprintCreationResult>
  
  // Ordenamiento por prioridad textual
  private comparePriorities(a: string, b: string): number {
    const priorityOrder = {
      'CRÍTICA': 1, 'ALTA': 2, 'MEDIA': 3, 'BAJA': 4, 'PENDIENTE': 5
    };
    return priorityOrder[a] - priorityOrder[b];
  }
}
```

**Algoritmo de fechas**:
- Inicio: **Próximo lunes**
- Duración: **2-4 semanas** según `estimatedWeeks` de la épica
- Secuencia: **Sin solapamiento**, cada sprint empieza cuando termina el anterior

### EpicProcessingService
**Ubicación**: `src/app/lib/supabase/epic-processing.service.ts`

```typescript
class EpicProcessingService {
  async processEpics(
    epics: EpicBasicInfo[],
    projectId: string,
    sprintMappings: SprintMapping[]
  ): Promise<EpicProcessingResult>
  
  validateEpics(epics: EpicBasicInfo[]): ValidationResult
}
```

**Mapeo épica → sprint**:
```typescript
const epicSprintMapping: Record<string, string> = {};
sprintMappings.forEach(sprint => {
  epicSprintMapping[sprint.epicId] = sprint.sprintId;
});
```

### StoryProcessingService + TaskProcessingService
**Ubicaciones**: 
- `src/app/lib/supabase/story-processing.service.ts`
- `src/app/lib/supabase/task-processing.service.ts`

**Patrón común**:
```typescript
interface ProcessingService<T, R> {
  validate(items: T[]): ValidationResult;
  process(items: T[], context: ProcessingContext): Promise<R>;
}
```

**Vinculación inteligente**:
- Historias → Épicas (por `epicId`)
- Tareas → Historias/Épicas (por `storyId` o `epicId`)
- Todas las tareas → Desarrollador fijo

## 🎯 Tipos y Schemas

### Prioridades Textuales
```typescript
// Antes (problemático)
priority: z.number().min(1).max(10)

// Después (solucionado)
priority: z.enum(['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'PENDIENTE'])
```

### Flujo de Tipos
```typescript
// Input
ImportRequest → {
  markdown: string,
  uploaderId: string,
  assigneeId?: string
}

// Procesamiento
ProjectAnalysis → ProjectCreationResult → SprintCreationResult → DetailedContent → ...

// Output
FullImportResult → {
  success: boolean,
  projectId?: string,
  summary?: ImportSummary,
  phases: Record<string, ImportPhaseResult>,
  feedback: ConsolidatedFeedback
}
```

## 🔒 Seguridad y Validación

### Múltiples Capas
1. **Schema Zod**: Validación estricta de tipos
2. **Business Logic**: Reglas de negocio por servicio
3. **Database**: Constraints y foreign keys
4. **User Permissions**: Validación de permisos por operación

### Constante de Seguridad
```typescript
const FIXED_DEVELOPER_ID = '06aec8c6-b939-491b-b711-f04d7670e045';
```

Todas las tareas se asignan **automáticamente** a este desarrollador, evitando problemas de permisos y asignación.

## 📊 Gestión de Estado

### ImportPhaseResult
```typescript
interface ImportPhaseResult {
  success: boolean;
  data?: ProjectAnalysis | ProjectCreationResult | SprintCreationResult | 
         DetailedContent | EpicProcessingData | StoryProcessingData | TaskProcessingData;
  error?: string;
  feedback?: ConsolidatedFeedback;
}
```

### FullImportResult
```typescript
interface FullImportResult {
  success: boolean;
  projectId?: string;
  summary?: {
    project: string;
    sprints: number;
    epics: number; 
    stories: number;
    tasks: number;
  };
  phases: {
    projectAnalysis: ImportPhaseResult;
    projectCreation: ImportPhaseResult;
    sprintCreation: ImportPhaseResult;
    detailedProcessing: ImportPhaseResult;
    epicProcessing: ImportPhaseResult;
    storyProcessing: ImportPhaseResult;
    taskProcessing: ImportPhaseResult;
  };
  feedback: ConsolidatedFeedback;
}
```

## 🚀 Optimizaciones

### Performance
- **Procesamiento paralelo** donde sea posible
- **Validación temprana** para fallar rápido
- **Streaming** de respuestas grandes
- **Connection pooling** en Supabase

### Escalabilidad
- **Servicios independientes** para scaling horizontal
- **Queue system** preparado para trabajos async
- **Rate limiting** en IA calls
- **Batch processing** para operaciones masivas

### Observabilidad
- **Logging estructurado** por fase
- **Métricas de performance** 
- **Error tracking** granular
- **Audit trail** completo

## 🔄 Patrones de Diseño Aplicados

1. **Orchestrator Pattern**: ImportOrchestrator coordina flujo
2. **Factory Pattern**: Creación de objetos con ProjectCreationService
3. **Strategy Pattern**: Diferentes estrategias de procesamiento por tipo
4. **Chain of Responsibility**: Flujo secuencial de fases
5. **Observer Pattern**: Feedback y logging en cada fase

---

Esta arquitectura garantiza **escalabilidad**, **mantenibilidad** y **observabilidad** del sistema de importación completo.
