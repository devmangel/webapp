interface RateLimitRecord {
  count: number;
  firstRequest: number;
}

// Almacenamiento en memoria para rate limiting
// En producción, esto debería usar Redis u otra solución distribuida
const ipRequests = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  maxRequests?: number;  // Máximo número de solicitudes permitidas en la ventana de tiempo
  windowMs?: number;     // Tamaño de la ventana de tiempo en milisegundos
}

export interface RateLimitResult {
  isLimited: boolean;    // true si se excedió el límite
  remaining: number;     // solicitudes restantes en la ventana actual
  resetTime: number;     // timestamp cuando se reiniciará el contador
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  maxRequests: 100,
  windowMs: 60000, // 1 minuto
};

/**
 * Verifica si una IP ha excedido el límite de solicitudes
 */
export function checkRateLimit(ip: string, config: RateLimitConfig = {}): RateLimitResult {
  const { maxRequests, windowMs } = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  
  if (!ipRequests.has(ip)) {
    // Primera solicitud de esta IP
    ipRequests.set(ip, { count: 1, firstRequest: now });
    return {
      isLimited: false,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }
  
  const record = ipRequests.get(ip)!;
  
  // Verificar si estamos en una nueva ventana de tiempo
  if (now - record.firstRequest > windowMs) {
    // Reiniciar para una nueva ventana
    ipRequests.set(ip, { count: 1, firstRequest: now });
    return {
      isLimited: false,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }
  
  // Incrementar contador
  record.count++;
  
  // Verificar si excede el límite
  const isLimited = record.count > maxRequests;
  const remaining = Math.max(0, maxRequests - record.count);
  const resetTime = record.firstRequest + windowMs;
  
  return {
    isLimited,
    remaining,
    resetTime
  };
}

/**
 * Limpia registros antiguos para evitar fugas de memoria
 * Debería ejecutarse periódicamente
 */
export function cleanupRateLimiter(maxAge: number = 3600000): void { // Por defecto 1 hora
  const now = Date.now();
  for (const [ip, record] of ipRequests.entries()) {
    if (now - record.firstRequest > maxAge) {
      ipRequests.delete(ip);
    }
  }
}

// Limpiar registros antiguos cada hora
setInterval(() => cleanupRateLimiter(), 3600000);
