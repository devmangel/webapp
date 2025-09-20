'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { Card, CardBody } from 'components/ui/Card';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onLoadExample: () => void;
  disabled?: boolean;
}

const MarkdownEditor = memo(function MarkdownEditor({
  value,
  onChange,
  onLoadExample,
  disabled = false
}: MarkdownEditorProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const markdownFile = files.find(file => 
      file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type === 'text/markdown'
    );
    
    if (markdownFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChange(content);
      };
      reader.readAsText(markdownFile);
    }
  }, [onChange]);

  const insertText = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + text + value.slice(end);
    
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [value, onChange]);

  const shortcuts = [
    { label: 'Epic', text: '# ÉPICA EP-XX — Título\n\n**Objetivo:** Descripción del objetivo\n\n## Historias\n\n' },
    { label: 'Historia', text: '* **ST-XX.X** Como [usuario] quiero [acción] para [beneficio].\n' },
    { label: 'Tarea', text: '* **XX-XX** Descripción de la tarea\n' },
  ];

  const stats = {
    lines: value.split('\n').length,
    words: value.trim() ? value.trim().split(/\s+/).length : 0,
    chars: value.length,
    epics: (value.match(/# ÉPICA/g) || []).length,
    stories: (value.match(/\* \*\*ST-/g) || []).length,
    tasks: (value.match(/\* \*\*[A-Z]+-\d+/g) || []).length - (value.match(/\* \*\*ST-/g) || []).length,
  };

  return (
    <Card className="overflow-hidden border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-750">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Editor de especificación
            </h3>
            <div className="flex items-center gap-3">
              {shortcuts.map((shortcut) => (
                <button
                  key={shortcut.label}
                  onClick={() => insertText(shortcut.text)}
                  disabled={disabled}
                  className="rounded-md bg-white border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  + {shortcut.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="rounded-md bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {showPreview ? '📝 Editor' : '👁 Preview'}
            </button>
            <button
              onClick={onLoadExample}
              disabled={disabled}
              className="rounded-md bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/30"
            >
              📄 Ejemplo
            </button>
          </div>
        </div>
        
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>{stats.lines} líneas</span>
          <span>{stats.words} palabras</span>
          <span>{stats.chars} caracteres</span>
          {stats.epics > 0 && <span className="text-blue-600 dark:text-blue-400">{stats.epics} épicas</span>}
          {stats.stories > 0 && <span className="text-green-600 dark:text-green-400">{stats.stories} historias</span>}
          {stats.tasks > 0 && <span className="text-purple-600 dark:text-purple-400">{stats.tasks} tareas</span>}
        </div>
      </div>

      <CardBody className="p-0">
        <div
          className={`relative transition-all duration-200 ${
            isDragOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {showPreview ? (
            <div className="h-96 overflow-auto p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {value ? (
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200">
                    {value}
                  </pre>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Escribe o pega tu especificación para ver el preview
                  </p>
                )}
              </div>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              rows={24}
              className="h-96 w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder-gray-500"
              placeholder="Pega aquí tu especificación en formato markdown

Ejemplo:
# ÉPICA EP-01 — Autenticación
**Objetivo:** Permitir a los usuarios registrarse y acceder

## Historias
* **ST-01.1** Como usuario quiero crear cuenta con email
* **ST-01.2** Como usuario quiero iniciar sesión

## Tareas Frontend
* **FE-01** Crear formularios de login y registro
* **FE-02** Validación de formularios

## Tareas Backend  
* **BE-01** Endpoints de autenticación
* **BE-02** Modelo de usuario"
            />
          )}
          
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 dark:bg-blue-900/30">
              <div className="rounded-lg bg-white border-2 border-dashed border-blue-300 p-8 shadow-lg dark:bg-gray-800 dark:border-blue-600">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <p className="mt-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Suelta tu archivo .md aquí
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Archivos markdown (.md, .markdown)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
});

export default MarkdownEditor;
