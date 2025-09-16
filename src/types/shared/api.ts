/**
 * Tipos genéricos para respuestas de API
 */

// Respuesta base de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Respuesta paginada
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Opciones de paginación
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filtros base
export interface BaseFilters {
  searchTerm?: string;
  createdAt?: {
    from?: string;
    to?: string;
  };
  updatedAt?: {
    from?: string;
    to?: string;
  };
}

// Metadata genérica para respuestas
export interface ResponseMetadata {
  requestId?: string;
  timestamp: string;
  version?: string;
}
