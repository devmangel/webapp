import { NextRequest } from 'next/server';
import { SecurityLog, SecurityThreat, BotDetection } from '../types/security';
import { DynamoLogService } from './dynamoLogService';

// Leer variable de entorno una sola vez para optimizar performance
const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === 'production';

interface LoggingOptions {
  botDetections: BotDetection[];
  securityThreats: SecurityThreat[];
  authInfo?: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
  };
  metadata?: Record<string, unknown>;
}

export function logSecurityEvent(req: NextRequest, options: LoggingOptions): SecurityLog {
  const { botDetections = [], securityThreats = [], authInfo, metadata = {} } = options;
  
  // Obtener información del cliente
  const userAgent = req.headers.get('user-agent') || '';
  const ip = req.headers.get('x-real-ip') || 
            req.headers.get('x-forwarded-for')?.split(',')[0] || 
            'IP no disponible';
  const host = req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  
  // Determinar nivel de gravedad
  let level: 'info' | 'warn' | 'error' | 'critical' = 'info';
  let eventType: 'request' | 'security_threat' | 'bot_detection' | 'auth_failure' | 'rate_limit' = 'request';
  
  if (securityThreats.length > 0) {
    eventType = 'security_threat';
    const maxSeverity = securityThreats.reduce((max, threat) => {
      const severityMap: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
      return Math.max(max, severityMap[threat.severity]);
    }, 0);
    
    level = ['info', 'warn', 'error', 'critical'][maxSeverity - 1] as 'info' | 'warn' | 'error' | 'critical';
  } else if (botDetections.some(bot => ['security_tool', 'malicious', 'scanner'].includes(bot.category))) {
    eventType = 'bot_detection';
    level = 'warn';
  } else if (botDetections.length > 0) {
    eventType = 'bot_detection';
    level = 'info';
  }
  
  // Extraer información de encabezados relevante
  const safeHeaders: Record<string, string> = {};
  const relevantHeaders = [
    'host', 'user-agent', 'referer', 'origin', 'accept', 
    'accept-language', 'accept-encoding', 'x-requested-with'
  ];
  
  for (const header of relevantHeaders) {
    const value = req.headers.get(header);
    if (value) safeHeaders[header] = value;
  }
  
  // Crear estructura de log
  const securityLog: SecurityLog = {
    timestamp: new Date().toISOString(),
    level,
    eventType,
    clientInfo: {
      ip,
      userAgent,
      isBot: botDetections.length > 0,
      botDetails: botDetections.length > 0 ? botDetections : undefined,
    },
    requestInfo: {
      method: req.method,
      path: req.nextUrl.pathname,
      host,
      protocol,
      query: Object.fromEntries(req.nextUrl.searchParams),
      headers: safeHeaders
    },
    securityInfo: securityThreats.length > 0 ? {
      threats: securityThreats,
      riskLevel: level as 'low' | 'medium' | 'high' | 'critical',
      recommendation: securityThreats.find(t => t.suggestedAction)?.suggestedAction
    } : undefined,
    authInfo,
    metadata
  };
  
  // Log en consola según nivel de severidad (siempre activo para debugging)
  // if (level === 'info') {
  //   console.log(JSON.stringify(securityLog, null, 2));
  // } else if (level === 'warn') {
  //   console.warn(JSON.stringify(securityLog, null, 2));
  // } else {
  //   console.error(JSON.stringify(securityLog, null, 2));
  // }

  // Persistir en DynamoDB solo en producción (sin bloquear el middleware)
  if (IS_PRODUCTION) {
    saveToDynamoDB(securityLog);
  }

  return securityLog;
}

/**
 * Guarda el log en DynamoDB de forma asíncrona
 * Solo se ejecuta en producción
 * Si falla, mantiene el fallback de console.log
 */
async function saveToDynamoDB(securityLog: SecurityLog): Promise<void> {
  try {
    await DynamoLogService.saveSecurityLog(securityLog);
  } catch (error) {
    console.error('Error persistiendo log en DynamoDB (fallback a console):', error);
    // El log ya se mostró en consola, no es necesario hacer nada más
    // Esto asegura que nunca se pierdan logs por problemas de DynamoDB
  }
}

/**
 * Función para guardar múltiples logs en batch
 * Solo funciona en producción
 * Útil para operaciones que generen múltiples logs
 */
export async function batchLogSecurityEvents(logs: SecurityLog[]): Promise<void> {
  if (logs.length === 0) return;
  
  // Solo persistir en DynamoDB si estamos en producción
  if (!IS_PRODUCTION) {
    console.log(`[DEV] Batch de ${logs.length} logs (solo console en desarrollo)`);
    logs.forEach(log => {
      console.log(`[DEV] Log: ${JSON.stringify(log, null, 2)}`);
    });
    return;
  }
  
  try {
    await DynamoLogService.batchSaveSecurityLogs(logs);
  } catch (error) {
    console.error('Error en batch save de logs DynamoDB:', error);
    // Fallback: log cada uno individualmente en consola
    logs.forEach(log => {
      console.log(`Fallback log: ${JSON.stringify(log, null, 2)}`);
    });
  }
}

/**
 * Función utilitaria para verificar si estamos en producción
 * Útil para otros módulos que necesiten esta información
 */
export function isProductionEnvironment(): boolean {
  return IS_PRODUCTION;
}
