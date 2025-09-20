import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { 
  AIProcessedBacklogSchema, 
  ProjectAnalysisSchema, 
  DetailedContentSchema,
  type AIProcessedBacklog, 
  type ProjectAnalysis, 
  type DetailedContent 
} from 'types/domain/import';

/**
 * Servicio para procesar markdown con IA usando estrategia híbrida
 * Primera llamada: analiza proyecto y épicas básicas
 * Segunda llamada: procesa historias y tareas detalladas
 */
export class MarkdownProcessor {
  
  /**
   * PRIMERA LLAMADA: Analiza el proyecto y extrae épicas básicas
   */
  static async processProjectAnalysis(markdown: string): Promise<ProjectAnalysis> {
    try {
      const prompt = this.createProjectAnalysisPrompt(markdown);
      
      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: ProjectAnalysisSchema,
        schemaName: 'projectAnalysis',
        schemaDescription: 'Análisis inicial del proyecto con metadatos y épicas básicas',
        prompt,
        temperature: 0.1,
      });

      return result.object;
    } catch (error) {
      console.error('Error en análisis inicial del proyecto:', error);
      
      // Fallback básico
      return {
        projectMetadata: {
          name: 'Proyecto Importado',
          suggestedCode: 'IMPORT-' + Date.now().toString().slice(-6),
          description: 'Proyecto generado automáticamente desde markdown'
        },
        epics: [],
        estimatedComplexity: 'MEDIUM',
        suggestedTeamSize: 1
      };
    }
  }

  /**
   * SEGUNDA LLAMADA: Procesa contenido detallado con contexto de épicas
   */
  static async processDetailedContent(
    markdown: string, 
    projectAnalysis: ProjectAnalysis, 
    assigneeId: string
  ): Promise<DetailedContent> {
    try {
      const prompt = this.createDetailedContentPrompt(markdown, projectAnalysis, assigneeId);
      
      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: DetailedContentSchema,
        schemaName: 'detailedContent',
        schemaDescription: 'Procesamiento detallado de historias y tareas con contexto de épicas',
        prompt,
        temperature: 0.1,
      });

      return result.object;
    } catch (error) {
      console.error('Error en procesamiento detallado:', error);
      
      // Fallback en caso de error
      return {
        success: false,
        stories: [],
        tasks: [],
        errors: [{
          type: 'CRITICAL',
          message: 'Error procesando contenido detallado con IA.',
          suggestion: 'Revise el formato del markdown y la estructura de historias/tareas.'
        }],
        warnings: [],
        completions: []
      };
    }
  }

  /**
   * Prompt para análisis inicial del proyecto
   */
  private static createProjectAnalysisPrompt(markdown: string): string {
    return `
Como experto en gestión de proyectos ágiles, analiza este documento markdown para extraer:

1. **METADATOS DEL PROYECTO:**
   - Nombre del proyecto (inferir del título o contenido)
   - Descripción breve del proyecto
   - Código sugerido (formato: PROJ-XXX basado en el nombre)
   - Duración estimada del proyecto

2. **ÉPICAS PRINCIPALES:**
   - Identificar las épicas principales del proyecto
   - Asignar prioridad (CRÍTICA, ALTA, MEDIA, BAJA, PENDIENTE)
   - Estimar duración en semanas por épica (1-12 semanas)
   - Extraer objetivo/descripción de cada épica

3. **ANÁLISIS GENERAL:**
   - Complejidad estimada del proyecto (LOW/MEDIUM/HIGH)
   - Tamaño de equipo sugerido (1-10 personas)

DOCUMENTO A ANALIZAR:
\`\`\`
${markdown}
\`\`\`

INSTRUCCIONES:
- Si no encuentras un título claro, infiere el nombre del proyecto del contenido
- Las épicas pueden estar en formato "# EP-XX", "## Épica", "# Feature", etc.
- Ordena épicas por importancia lógica (infraestructura → funcionalidad → optimización)
- Sé conservador en estimaciones de tiempo

Responde ÚNICAMENTE con JSON válido, sin texto adicional.
`;
  }

  /**
   * Prompt para procesamiento detallado
   */
  private static createDetailedContentPrompt(
    markdown: string, 
    projectAnalysis: ProjectAnalysis, 
    assigneeId: string
  ): string {
    const epicsContext = projectAnalysis.epics
      .map(epic => `- ${epic.id}: ${epic.title} (${epic.objective || 'Sin objetivo definido'})`)
      .join('\n');

    return `
Como experto en análisis de requisitos ágiles, procesa este documento para extraer historias y tareas detalladas.

CONTEXTO DEL PROYECTO:
- Nombre: ${projectAnalysis.projectMetadata.name}
- Épicas identificadas:
${epicsContext}

DOCUMENTO A PROCESAR:
\`\`\`
${markdown}
\`\`\`

INSTRUCCIONES ESPECÍFICAS:

1. **HISTORIAS DE USUARIO:**
   - Extraer todas las historias (formato "Como X quiero Y para Z" o similares)
   - Vincular cada historia a su épica correspondiente usando los IDs del contexto
   - Generar criterios de aceptación si no existen
   - Estimar story points (Fibonacci: 1,2,3,5,8,13,21) según complejidad
   - Completar descripción si está incompleta

2. **TAREAS TÉCNICAS:**
   - Identificar tareas de implementación (FE/BE/OPS/DOCS/TEST)
   - Vincular a historias o épicas según corresponda
   - Asignar TODAS las tareas al desarrollador: ${assigneeId}
   - Inferir tipo de tarea del contexto o nombre
   - Generar descripción técnica si falta

3. **VALIDACIÓN:**
   - Verificar que todas las historias tengan épica padre válida
   - Asegurar que los IDs sean únicos
   - Detectar referencias rotas entre elementos

4. **FEEDBACK:**
   - ERRORES: Solo problemas que impidan la importación
   - WARNINGS: Campos auto-completados o mejoras sugeridas  
   - COMPLETIONS: Qué se generó automáticamente

IMPORTANTE: Usa SOLO los IDs de épicas del contexto proporcionado. No inventes épicas nuevas.

Responde ÚNICAMENTE con JSON válido, sin texto adicional.
`;
  }

  /**
   * MÉTODO LEGACY: Mantener para compatibilidad hacia atrás
   */
  private static createPrompt(markdown: string, assigneeId: string): string {
    return `
Como experto en gestión de proyectos ágiles y análisis de especificaciones técnicas, necesito que analices este documento markdown y lo conviertas en una estructura de backlog válida.

MARKDOWN A PROCESAR:
\`\`\`
${markdown}
\`\`\`

INSTRUCCIONES ESPECÍFICAS:

1. ANÁLISIS Y VALIDACIÓN:
   - Identifica épicas, historias y tareas en cualquier formato que encuentres
   - Valida que los IDs sean únicos y no duplicados
   - Verifica que las historias tengan épicas padre válidas
   - Detecta errores críticos que impidan la importación

2. AUTO-COMPLETAR CAMPOS FALTANTES:
   - Si falta descripción de épicas/historias, genérala basándote en el contexto
   - Estima story points usando escala Fibonacci (1,2,3,5,8,13,21) según complejidad
   - Genera criterios de aceptación básicos si no existen
   - Infiere tipo de tareas (FE/BE/OPS/DOCS/TEST) del contexto o ID
   - Crea títulos descriptivos para tareas si están incompletos

3. FEEDBACK DETALLADO:
   - ERRORES: Solo problemas que bloqueen la importación
   - WARNINGS: Campos completados automáticamente o sugerencias de mejora
   - COMPLETIONS: Lista de qué se generó automáticamente

4. ASIGNACIÓN:
   - Todas las tareas deben asignarse al desarrollador: ${assigneeId}

5. FORMATO DE RESPUESTA:
   - success: true si el documento es procesable (aunque necesite auto-completar)
   - success: false solo si hay errores críticos irrecuperables
   - Incluye ubicación específica de errores cuando sea posible

EJEMPLOS DE FORMATOS SOPORTADOS:
- "# EP-01 — Título épica" o "# ÉPICA EP-01 — Título" 
- "* **ST-01.1** Como usuario quiero..." o "## ST-01.1 Historia"
- "* **FE-01** Implementar componente" o "- FE-01: Tarea frontend"
- Secciones como "## Tareas Frontend" o "### Criterios de aceptación"

Responde ÚNICAMENTE con el JSON válido según el schema, sin texto adicional.
`;
  }

  /**
   * Procesa markdown usando IA para extraer estructura de backlog
   */
  static async processMarkdown(markdown: string, assigneeId: string): Promise<AIProcessedBacklog> {
    try {
      const prompt = this.createPrompt(markdown, assigneeId);
      
      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: AIProcessedBacklogSchema,
        schemaName: 'processedBacklog',
        schemaDescription: 'Estructura de backlog procesada y validada con feedback detallado',
        prompt,
        temperature: 0.1,
      });

      return result.object;
    } catch (error) {
      console.error('Error procesando markdown con IA:', error);
      
      // Fallback en caso de error de IA
      return {
        success: false,
        epics: [],
        stories: [],
        tasks: [],
        errors: [{
          type: 'CRITICAL',
          message: 'Error procesando el documento con IA. Verifique el formato del markdown.',
          suggestion: 'Asegúrese de que el documento tenga una estructura válida con épicas e historias.'
        }],
        warnings: [],
        completions: []
      };
    }
  }

  /**
   * Valida que el resultado procesado sea coherente
   */
  static validateProcessedBacklog(processed: AIProcessedBacklog): {
    isValid: boolean;
    validationErrors: string[];
  } {
    const validationErrors: string[] = [];

    // Verificar que tenga al menos una épica si success es true
    if (processed.success && processed.epics.length === 0) {
      validationErrors.push('No se encontraron épicas en el documento');
    }

    // Verificar que las historias tengan épicas padre válidas
    const epicIds = new Set(processed.epics.map(e => e.id));
    for (const story of processed.stories) {
      if (!epicIds.has(story.epicId)) {
        validationErrors.push(`Historia ${story.id} referencia épica inexistente: ${story.epicId}`);
      }
    }

    // Verificar IDs únicos
    const allIds = [
      ...processed.epics.map(e => e.id),
      ...processed.stories.map(s => s.id),
      ...processed.tasks.map(t => t.id)
    ];
    const uniqueIds = new Set(allIds);
    if (allIds.length !== uniqueIds.size) {
      validationErrors.push('Se encontraron IDs duplicados en el backlog procesado');
    }

    return {
      isValid: validationErrors.length === 0,
      validationErrors
    };
  }
}
