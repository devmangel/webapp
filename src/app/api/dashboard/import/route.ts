import { NextRequest, NextResponse } from 'next/server';
import { MarkdownProcessor } from 'app/lib/ai/markdown-processor';
import { ImportService } from 'app/lib/supabase/import-service';
import type { ImportRequest } from 'types/domain/dashboard/import';

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    const { markdown, projectId, assigneeId } = body;

    if (!markdown || !projectId || !assigneeId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    console.log('Iniciando importación:', { projectId, assigneeId });

    const importService = new ImportService();

    // 1. Validar que proyecto y usuario existan
    const validation = await importService.validateProjectAndUser(projectId, assigneeId);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 404 }
      );
    }

    // 2. Procesar markdown con IA
    console.log('Procesando markdown con IA...');
    const processedData = await MarkdownProcessor.processMarkdown(markdown, assigneeId);
    
    // 3. Validar resultado de IA
    const aiValidation = MarkdownProcessor.validateProcessedBacklog(processedData);
    if (!aiValidation.isValid) {
      return NextResponse.json({
        success: false,
        feedback: {
          errors: processedData.errors.concat(
            aiValidation.validationErrors.map(error => ({
              type: 'CRITICAL' as const,
              message: error
            }))
          ),
          warnings: processedData.warnings,
          completions: processedData.completions
        }
      }, { status: 400 });
    }

    // 4. Si hay errores críticos de IA, retornar feedback
    if (!processedData.success || processedData.errors.length > 0) {
      return NextResponse.json({
        success: false,
        feedback: {
          errors: processedData.errors,
          warnings: processedData.warnings,
          completions: processedData.completions
        }
      }, { status: 400 });
    }

    // 5. Procesar e insertar en base de datos
    console.log('Insertando en base de datos...');
    const result = await importService.processImport(
      markdown,
      processedData,
      projectId,
      assigneeId
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error en importación:', error);
    return NextResponse.json(
      { 
        success: false,
        feedback: {
          errors: [{
            type: 'CRITICAL',
            message: 'Error procesando importación',
            suggestion: error instanceof Error ? error.message : 'Error desconocido'
          }],
          warnings: [],
          completions: []
        }
      },
      { status: 500 }
    );
  }
}
