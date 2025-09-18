import { NextRequest, NextResponse } from 'next/server';
import { ImportOrchestrator } from 'app/lib/supabase/import-orchestrator.service';
import type { ImportRequest } from 'types/domain/dashboard/import';

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    const { markdown, uploaderId, assigneeId } = body;

    if (!markdown || !uploaderId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (markdown, uploaderId)' },
        { status: 400 }
      );
    }

    console.log('🚀 Iniciando importación completa con creación automática de proyecto');
    console.log('📊 Parámetros:', { 
      uploaderId, 
      assigneeId: assigneeId || 'Desarrollador fijo automático',
      markdownLength: markdown.length 
    });

    // Inicializar orquestador e iniciar importación completa
    const orchestrator = new ImportOrchestrator();
    
    const result = await orchestrator.processFullImport({
      markdown,
      uploaderId,
      assigneeId
    });

    // Log del resultado para debugging
    if (result.success) {
      console.log('✅ Importación exitosa:', {
        projectId: result.projectId,
        summary: result.summary
      });
    } else {
      console.log('❌ Importación falló:', {
        errors: result.feedback?.errors?.map(e => e.message)
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 Error crítico en endpoint de importación:', error);
    return NextResponse.json(
      { 
        success: false,
        feedback: {
          errors: [{
            type: 'CRITICAL' as const,
            message: 'Error crítico del servidor',
            suggestion: error instanceof Error ? error.message : 'Error desconocido del sistema'
          }],
          warnings: [],
          completions: []
        }
      },
      { status: 500 }
    );
  }
}
