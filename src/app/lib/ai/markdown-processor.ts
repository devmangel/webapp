import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { AIProcessedBacklogSchema, type AIProcessedBacklog } from 'types/domain/dashboard/import';

/**
 * Servicio para procesar markdown con IA
 * Convierte markdown crudo en estructura de backlog validada
 */
export class MarkdownProcessor {
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
