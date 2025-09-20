import { MarkdownProcessor } from '../ai/markdown-processor';
import { ProjectCreationService } from './project-creation.service';
import { SprintGenerationService } from './sprint-generation.service';
import { EpicProcessingService } from './epic-processing.service';
import { StoryProcessingService } from './story-processing.service';
import { TaskProcessingService } from './task-processing.service';

import type { 
  ImportRequest, 
  FullImportResult, 
  ImportPhaseResult,
  ProjectAnalysis,
  ProjectCreationResult,
  SprintCreationResult,
  DetailedContent,
  EpicProcessingData,
  StoryProcessingData,
  TaskProcessingData
} from 'types/domain/dashboard/import';

// Constante del desarrollador fijo
const FIXED_DEVELOPER_ID = '06aec8c6-b939-491b-b711-f04d7670e045';

/**
 * Orquestador principal para importación completa de markdown
 * Coordina todos los servicios especializados en el flujo híbrido
 */
export class ImportOrchestrator {
  private projectService = new ProjectCreationService();
  private sprintService = new SprintGenerationService();
  private epicService = new EpicProcessingService();
  private storyService = new StoryProcessingService();
  private taskService = new TaskProcessingService();

  /**
   * Flujo completo de importación con estrategia híbrida
   */
  async processFullImport(request: ImportRequest): Promise<FullImportResult> {
    const result: FullImportResult = {
      success: false,
      phases: {
        projectAnalysis: { success: false },
        projectCreation: { success: false },
        sprintCreation: { success: false },
        detailedProcessing: { success: false },
        epicProcessing: { success: false },
        storyProcessing: { success: false },
        taskProcessing: { success: false },
      },
      feedback: {
        errors: [],
        warnings: [],
        completions: []
      }
    };

    const assigneeId = request.assigneeId || FIXED_DEVELOPER_ID;
    let projectId: string | undefined;
    
    try {
      // FASE 1: Análisis inicial del proyecto con IA
      console.log('🔍 Iniciando análisis del proyecto...');
      const projectAnalysisResult = await this.executeProjectAnalysis(request.markdown);
      result.phases.projectAnalysis = projectAnalysisResult;
      
      if (!projectAnalysisResult.success || !projectAnalysisResult.data) {
        return this.buildFailureResult(result, 'Falló el análisis inicial del proyecto');
      }

      const projectAnalysis = projectAnalysisResult.data as ProjectAnalysis;
      
      // FASE 2: Validar permisos del usuario
      console.log('👤 Validando permisos de usuario...');
      const permissionsValid = await this.projectService.validateUserPermissions(request.uploaderId);
      if (!permissionsValid.canCreate) {
        return this.buildFailureResult(result, permissionsValid.error || 'Usuario sin permisos');
      }

      // FASE 3: Crear proyecto
      console.log('📂 Creando proyecto...');
      const projectCreationResult = await this.executeProjectCreation(projectAnalysis, request.uploaderId);
      result.phases.projectCreation = projectCreationResult;
      
      if (!projectCreationResult.success || !projectCreationResult.data) {
        return this.buildFailureResult(result, 'Falló la creación del proyecto');
      }

      const projectCreation = projectCreationResult.data as ProjectCreationResult;
      projectId = projectCreation.projectId;

      // FASE 4: Generar sprints por épicas
      console.log('🏃‍♂️ Generando sprints...');
      const sprintCreationResult = await this.executeSprintCreation(projectId, projectAnalysis.epics);
      result.phases.sprintCreation = sprintCreationResult;
      
      if (!sprintCreationResult.success || !sprintCreationResult.data) {
        return this.buildFailureResult(result, 'Falló la generación de sprints', projectId);
      }

      const sprintCreation = sprintCreationResult.data as SprintCreationResult;

      // FASE 5: Procesamiento detallado con IA (segunda llamada)
      console.log('📋 Procesando contenido detallado...');
      const detailedProcessingResult = await this.executeDetailedProcessing(
        request.markdown, 
        projectAnalysis, 
        assigneeId
      );
      result.phases.detailedProcessing = detailedProcessingResult;
      
      if (!detailedProcessingResult.success || !detailedProcessingResult.data) {
        return this.buildFailureResult(result, 'Falló el procesamiento detallado', projectId);
      }

      const detailedContent = detailedProcessingResult.data as DetailedContent;

      // Crear mapping épica → sprint
      const epicSprintMapping: Record<string, string> = {};
      sprintCreation.sprints.forEach(sprint => {
        epicSprintMapping[sprint.epicId] = sprint.sprintId;
      });

      // FASE 6: Procesar épicas
      console.log('🎯 Procesando épicas...');
      const epicProcessingResult = await this.executeEpicProcessing(
        projectAnalysis.epics, 
        projectId, 
        sprintCreation.sprints
      );
      result.phases.epicProcessing = epicProcessingResult;
      
      if (!epicProcessingResult.success || !epicProcessingResult.data) {
        return this.buildFailureResult(result, 'Falló el procesamiento de épicas', projectId);
      }

      const createdEpics = (epicProcessingResult.data as EpicProcessingData).epics;

      // FASE 7: Procesar historias
      console.log('📚 Procesando historias...');
      const storyProcessingResult = await this.executeStoryProcessing(
        detailedContent.stories,
        projectId,
        createdEpics,
        epicSprintMapping,
        assigneeId
      );
      result.phases.storyProcessing = storyProcessingResult;
      
      if (!storyProcessingResult.success || !storyProcessingResult.data) {
        return this.buildFailureResult(result, 'Falló el procesamiento de historias', projectId);
      }

      const createdStories = (storyProcessingResult.data as StoryProcessingData).stories;

      // FASE 8: Procesar tareas (asignación al desarrollador fijo)
      console.log('⚙️ Procesando tareas...');
      const taskProcessingResult = await this.executeTaskProcessing(
        detailedContent.tasks,
        projectId,
        createdEpics,
        createdStories,
        epicSprintMapping,
        assigneeId
      );
      result.phases.taskProcessing = taskProcessingResult;
      
      if (!taskProcessingResult.success) {
        return this.buildFailureResult(result, 'Falló el procesamiento de tareas', projectId);
      }

      // ✅ ÉXITO COMPLETO
      console.log('✅ Importación completada exitosamente');
      
      return this.buildSuccessResult(
        result,
        projectCreation,
        projectAnalysis,
        sprintCreation,
        detailedContent
      );

    } catch (error) {
      console.error('❌ Error crítico en importación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return this.buildFailureResult(result, `Error crítico: ${errorMessage}`, projectId);
    }
  }

  /**
   * Ejecuta análisis inicial del proyecto
   */
  private async executeProjectAnalysis(markdown: string): Promise<ImportPhaseResult> {
    try {
      const projectAnalysis = await MarkdownProcessor.processProjectAnalysis(markdown);
      
      return {
        success: true,
        data: projectAnalysis,
        feedback: {
          errors: [],
          warnings: [],
          completions: [{
            type: 'PROJECT_METADATA',
            target: 'Proyecto',
            generated: projectAnalysis.projectMetadata.name
          }]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en análisis de proyecto',
        feedback: {
          errors: [{
            type: 'CRITICAL',
            message: 'No se pudo analizar el proyecto con IA'
          }],
          warnings: [],
          completions: []
        }
      };
    }
  }

  /**
   * Ejecuta creación de proyecto
   */
  private async executeProjectCreation(
    projectAnalysis: ProjectAnalysis, 
    ownerId: string
  ): Promise<ImportPhaseResult> {
    try {
      const { result, error } = await this.projectService.createProject(
        projectAnalysis.projectMetadata,
        ownerId
      );

      if (error || !result) {
        return {
          success: false,
          error: error || 'No se pudo crear el proyecto',
          feedback: {
            errors: [{ type: 'CRITICAL', message: error || 'Error desconocido' }],
            warnings: [],
            completions: []
          }
        };
      }

      return {
        success: true,
        data: result,
        feedback: {
          errors: [],
          warnings: [],
          completions: [{
            type: 'PROJECT_METADATA',
            target: 'Código del proyecto',
            generated: result.projectCode
          }]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error creando proyecto',
        feedback: {
          errors: [{ type: 'CRITICAL', message: 'Error interno creando proyecto' }],
          warnings: [],
          completions: []
        }
      };
    }
  }

  /**
   * Ejecuta creación de sprints
   */
  private async executeSprintCreation(
    projectId: string,
    epics: ProjectAnalysis['epics']
  ): Promise<ImportPhaseResult> {
    try {
      // Validar épicas antes de generar sprints
      const validation = this.sprintService.validateEpics(epics);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Épicas inválidas: ${validation.errors.join(', ')}`,
          feedback: {
            errors: validation.errors.map(e => ({ type: 'VALIDATION' as const, message: e })),
            warnings: [],
            completions: []
          }
        };
      }

      const { result, error } = await this.sprintService.generateSprintsFromEpics(projectId, epics);

      if (error || !result) {
        return {
          success: false,
          error: error || 'No se pudieron crear sprints',
          feedback: {
            errors: [{ type: 'CRITICAL', message: error || 'Error desconocido' }],
            warnings: [],
            completions: []
          }
        };
      }

      return {
        success: true,
        data: result,
        feedback: {
          errors: [],
          warnings: [],
          completions: [{
            type: 'PROJECT_METADATA',
            target: 'Sprints generados',
            generated: result.totalSprints
          }]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error generando sprints',
        feedback: {
          errors: [{ type: 'CRITICAL', message: 'Error interno generando sprints' }],
          warnings: [],
          completions: []
        }
      };
    }
  }

  /**
   * Ejecuta procesamiento detallado con IA
   */
  private async executeDetailedProcessing(
    markdown: string,
    projectAnalysis: ProjectAnalysis,
    assigneeId: string
  ): Promise<ImportPhaseResult> {
    try {
      const detailedContent = await MarkdownProcessor.processDetailedContent(
        markdown,
        projectAnalysis,
        assigneeId
      );

      const feedback: ImportPhaseResult['feedback'] = {
        errors: detailedContent.errors || [],
        warnings: detailedContent.warnings || [],
        completions: detailedContent.completions || []
      };

      return {
        success: detailedContent.success,
        data: detailedContent,
        error: !detailedContent.success ? 'Procesamiento detallado falló' : undefined,
        feedback
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en procesamiento detallado',
        feedback: {
          errors: [{
            type: 'CRITICAL',
            message: 'No se pudo procesar el contenido detallado con IA'
          }],
          warnings: [],
          completions: []
        }
      };
    }
  }

  /**
   * Ejecuta procesamiento de épicas
   */
  private async executeEpicProcessing(
    epics: ProjectAnalysis['epics'],
    projectId: string,
    sprintMappings: SprintCreationResult['sprints']
  ): Promise<ImportPhaseResult> {
    try {
      // Validar épicas
      const validation = this.epicService.validateEpics(epics);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Épicas inválidas: ${validation.errors.join(', ')}`,
          feedback: {
            errors: validation.errors.map(e => ({ type: 'VALIDATION' as const, message: e })),
            warnings: [],
            completions: []
          }
        };
      }

      const { epics: createdEpics, error } = await this.epicService.processEpics(
        validation.validEpics,
        projectId,
        sprintMappings
      );

      if (error || !createdEpics) {
        return {
          success: false,
          error: error || 'No se pudieron crear épicas',
          feedback: {
            errors: [{ type: 'CRITICAL', message: error || 'Error desconocido' }],
            warnings: [],
            completions: []
          }
        };
      }

      return {
        success: true,
        data: { epics: createdEpics } as EpicProcessingData,
        feedback: {
          errors: [],
          warnings: [],
          completions: [{
            type: 'PROJECT_METADATA',
            target: 'Épicas creadas',
            generated: createdEpics.length
          }]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error procesando épicas',
        feedback: {
          errors: [{ type: 'CRITICAL', message: 'Error interno procesando épicas' }],
          warnings: [],
          completions: []
        }
      };
    }
  }

  /**
   * Ejecuta procesamiento de historias
   */
  private async executeStoryProcessing(
    stories: DetailedContent['stories'],
    projectId: string,
    createdEpics: EpicProcessingData['epics'],
    epicSprintMapping: Record<string, string>,
    assigneeId: string
  ): Promise<ImportPhaseResult> {
    try {
      if (stories.length === 0) {
        return {
          success: true,
          data: { stories: [] } as StoryProcessingData,
          feedback: {
            errors: [],
            warnings: [{ type: 'SUGGESTION', message: 'No se encontraron historias para procesar' }],
            completions: []
          }
        };
      }

      // Validar historias
      const validation = this.storyService.validateStories(stories);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Historias inválidas: ${validation.errors.join(', ')}`,
          feedback: {
            errors: validation.errors.map(e => ({ type: 'VALIDATION' as const, message: e })),
            warnings: [],
            completions: []
          }
        };
      }

      const { stories: createdStories, error } = await this.storyService.processStories(
        validation.validStories,
        projectId,
        createdEpics,
        epicSprintMapping,
        assigneeId
      );

      if (error || !createdStories) {
        return {
          success: false,
          error: error || 'No se pudieron crear historias',
          feedback: {
            errors: [{ type: 'CRITICAL', message: error || 'Error desconocido' }],
            warnings: [],
            completions: []
          }
        };
      }

      return {
        success: true,
        data: { stories: createdStories } as StoryProcessingData,
        feedback: {
          errors: [],
          warnings: [],
          completions: [{
            type: 'PROJECT_METADATA',
            target: 'Historias creadas',
            generated: createdStories.length
          }]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error procesando historias',
        feedback: {
          errors: [{ type: 'CRITICAL', message: 'Error interno procesando historias' }],
          warnings: [],
          completions: []
        }
      };
    }
  }

  /**
   * Ejecuta procesamiento de tareas
   */
  private async executeTaskProcessing(
    tasks: DetailedContent['tasks'],
    projectId: string,
    createdEpics: EpicProcessingData['epics'],
    createdStories: StoryProcessingData['stories'],
    epicSprintMapping: Record<string, string>,
    assigneeId: string
  ): Promise<ImportPhaseResult> {
    try {
      if (tasks.length === 0) {
        return {
          success: true,
          data: { tasks: [] } as TaskProcessingData,
          feedback: {
            errors: [],
            warnings: [{ type: 'SUGGESTION', message: 'No se encontraron tareas para procesar' }],
            completions: []
          }
        };
      }

      // Validar tareas
      const validation = this.taskService.validateTasks(tasks);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Tareas inválidas: ${validation.errors.join(', ')}`,
          feedback: {
            errors: validation.errors.map(e => ({ type: 'VALIDATION' as const, message: e })),
            warnings: [],
            completions: []
          }
        };
      }

      const { tasks: createdTasks, error } = await this.taskService.processTasks(
        validation.validTasks,
        projectId,
        createdEpics,
        createdStories,
        epicSprintMapping,
        assigneeId
      );

      if (error || !createdTasks) {
        return {
          success: false,
          error: error || 'No se pudieron crear tareas',
          feedback: {
            errors: [{ type: 'CRITICAL', message: error || 'Error desconocido' }],
            warnings: [],
            completions: []
          }
        };
      }

      return {
        success: true,
        data: { tasks: createdTasks } as TaskProcessingData,
        feedback: {
          errors: [],
          warnings: [],
          completions: [
            {
              type: 'PROJECT_METADATA',
              target: 'Tareas creadas',
              generated: createdTasks.length
            },
            {
              type: 'PROJECT_METADATA',
              target: 'Desarrollador asignado',
              generated: 'Todas las tareas asignadas automáticamente'
            }
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error procesando tareas',
        feedback: {
          errors: [{ type: 'CRITICAL', message: 'Error interno procesando tareas' }],
          warnings: [],
          completions: []
        }
      };
    }
  }

  /**
   * Construye resultado de fallo con limpieza opcional
   */
  private buildFailureResult(
    result: FullImportResult, 
    errorMessage: string, 
    projectId?: string
  ): FullImportResult {
    result.success = false;
    result.feedback!.errors.push({
      type: 'CRITICAL',
      message: errorMessage
    });

    // TODO: Implementar rollback/cleanup si es necesario
    if (projectId) {
      console.warn(`⚠️ Proyecto ${projectId} puede necesitar limpieza manual`);
    }

    return result;
  }

  /**
   * Construye resultado de éxito con estadísticas
   */
  private buildSuccessResult(
    result: FullImportResult,
    projectCreation: ProjectCreationResult,
    projectAnalysis: ProjectAnalysis,
    sprintCreation: SprintCreationResult,
    detailedContent: DetailedContent
  ): FullImportResult {
    result.success = true;
    result.projectId = projectCreation.projectId;
    result.summary = {
      project: projectCreation.projectName,
      sprints: sprintCreation.totalSprints,
      epics: projectAnalysis.epics.length,
      stories: detailedContent.stories.length,
      tasks: detailedContent.tasks.length,
    };

    // Consolidar feedback de todas las fases
    const allFeedback = Object.values(result.phases)
      .filter(phase => phase.feedback)
      .map(phase => phase.feedback!);

    result.feedback = {
      errors: allFeedback.flatMap(f => f.errors),
      warnings: allFeedback.flatMap(f => f.warnings), 
      completions: allFeedback.flatMap(f => f.completions)
    };

    return result;
  }
}
